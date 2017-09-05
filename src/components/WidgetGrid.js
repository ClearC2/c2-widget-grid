import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {WidthProvider, Responsive as ResponsiveGrid, utils} from 'react-grid-layout'
const ReactGridLayout = WidthProvider(ResponsiveGrid)

function generateUUID () {
  let d = new Date().getTime()
  if (typeof window.performance !== 'undefined' && typeof window.performance.now === 'function') {
    d += window.performance.now()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export default class WidgetGrid extends Component {
  static propTypes = {
    components: PropTypes.object,
    onChange: PropTypes.func,
    layouts: PropTypes.object,
    widgets: PropTypes.object,
    locked: PropTypes.bool,
    widgetContainer: PropTypes.func,
    common: PropTypes.object,
    breakpoints: PropTypes.object,
    width: PropTypes.number
  }

  static defaultProps = {
    className: "layout",
    breakpoints: {xl: 1800, lg: 1400, md: 1200, sm: 768, xs: 480, xxs: 0},
    cols: {xl: 10, lg: 8, md: 5, sm: 4, xs: 2, xxs: 1},
    rowHeight: 100,
    onLayoutChange: () => {},
    common: {}
  }

  constructor (props) {
    super(props)
    const layouts = props.layouts || {}
    const breakpoint = ResponsiveGrid.utils.getBreakpointFromWidth(props.breakpoints, props.width)
    let items = layouts[breakpoint] || []
    if (!items.length) {
      const sortedBreakpoints = ResponsiveGrid.utils.sortBreakpoints(props.breakpoints).reverse()
      sortedBreakpoints.forEach(size => {
        if (layouts[size] && !items.length) items = layouts[size]
      })
    }

    this.state = {
      mounted: false,
      layouts,
      items: items || [],
      widgets: props.widgets || {}
    }
  }

  componentDidMount () {
    this.setState({mounted: true})
  }

  onBreakpointChange = (breakpoint, cols) => {
    this.setState({breakpoint, cols})
  }

  onLayoutChange = (layout, layouts) => {
    this.setState({layouts})
    this.onChange(layouts, this.state.widgets)
  }

  addWidget = (gridItem, componentKey, widget = {}) => {
    this.addWidgets([{gridItem, componentKey, widget}])
  }

  getNextPosition ({w, h}) {
    const items = this.state.layouts[this.state.breakpoint] || []
    let x = -1, y = 0, position
    const {cols} = this.state
    while (!position) {
      ++x
      if ((x + w) > cols) {
        x = 0
        ++y
      }
      const subject = {x, y, w, h}
      let collides = false
      items.forEach(item => {
        if (utils.collides(subject, item)) {
          collides = true
        }
      })
      if (!collides) {
        position = subject
      }
    }
    return position
  }

  addWidgets = (widgetConfigs = []) => {
    let {items, widgets} = this.state
    widgetConfigs.forEach(obj => {
      const {w = 1, h = 2, i = generateUUID()} = obj.gridItem
      const validPosition = this.getNextPosition({w, h})

      items = items.concat({
        ...obj.gridItem,
        i,
        x: validPosition.x,
        y: validPosition.y,
        w,
        h
      })
      widgets = {
        ...widgets,
        [i]: {
          ...(obj.widget || {}),
          componentKey: obj.componentKey
        }
      }
    })
    this.setState({items, widgets})
  }

  remove = i => {
    let index = -1
    this.state.items.forEach((item, pos) => {
      if (item.i === i) index = pos
    })

    if (index === -1) return

    const {items} = this.state
    items.splice(index, 1)
    const widgets = this.state.widgets
    delete widgets[i]
    this.setState({items, widgets})
  }

  updateWidget = (i, props) => {
    const widgets = {
      ...this.state.widgets,
      [i]: {
        ...this.state.widgets[i],
        ...props
      }
    }
    this.setState({widgets})
    this.onChange(this.state.layouts, widgets)
  }

  onChange = (layouts, widgets) => {
    if (this.props.onChange) {
      this.props.onChange(layouts, widgets)
    }
  }

  getValidItems () {
    return (this.state.items || [])
      .filter(item => !!this.state.widgets[item.i])
      .filter(item => {
        const widget = this.state.widgets[item.i]
        return !!this.props.components[widget.componentKey]
      })
  }

  render () {
    return (
      <ReactGridLayout
          {...this.props}
          layouts={this.state.layouts}
          onLayoutChange={this.onLayoutChange}
          onBreakpointChange={this.onBreakpointChange}
          measureBeforeMount={false}
          useCSSTransforms={this.state.mounted}>
          {this.getValidItems().map(item => {
            const widget = this.state.widgets[item.i]
            const {componentKey, ...widgetProps} = widget
            const Component = this.props.components[componentKey]
            const wProps = {
              widget: widgetProps,
              item,
              common: this.props.common
            }

            const container = this.props.widgetContainer || defaultWidgetContainer

            return container({
              ...wProps,
              remove: () => this.remove(item.i),
              children: Component ? <Component {...wProps} updateWidget={props => this.updateWidget(item.i, props)}/> : item.i
            })
          })}
      </ReactGridLayout>
    )
  }
}

function defaultWidgetContainer ({item, common, children, remove}) {
  return (
    <div key={item.i} data-grid={item} style={{border: '1px solid black'}}>
      {common.locked ? null : (
        <div style={{clear: 'both', textAlign: 'right'}}>
          <a onClick={remove} className="pointer">&times; &nbsp;</a>
        </div>
      )}
      {children}
    </div>
  )
}

defaultWidgetContainer.propTypes = {
  item: PropTypes.object,
  common: PropTypes.object,
  children: PropTypes.node,
  remove: PropTypes.func
}
