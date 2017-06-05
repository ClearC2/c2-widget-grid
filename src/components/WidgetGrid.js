import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {WidthProvider, Responsive as ResponsiveGrid} from 'react-grid-layout'
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
    measureBeforeMount: PropTypes.bool
  }

  static defaultProps = {
    className: "layout",
    breakpoints: {xl: 1800, lg: 1400, md: 1200, sm: 768, xs: 480, xxs: 0},
    cols: {xl: 10, lg: 8, md: 5, sm: 4, xs: 2, xxs: 1},
    rowHeight: 100,
    onLayoutChange: () => {},
    common: {},
    measureBeforeMount: false
  }

  constructor (props) {
    super(props)
    const layouts = props.layouts || {}
    let items = []
    Object.keys(layouts).forEach(size => {
      if (layouts[size].length) items = layouts[size]
    })

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
    this.setState({cols: cols})
  }

  onLayoutChange = (layout, layouts) => {
    this.setState({layouts})
    this.onChange(layouts, this.state.widgets)
  }

  addWidget = (gridItem, componentKey, widget = {}) => {
    this.addWidgets([{gridItem, componentKey, widget}])
  }

  addWidgets = (widgetConfigs = []) => {
    let {items, widgets, cols = 12} = this.state
    widgetConfigs.forEach(obj => {
      const {x, y, w = 1, h = 2, i = generateUUID()} = obj.gridItem
      items = items.concat({
        ...obj.gridItem,
        i,
        x: x || items.length * 2 % cols,
        y: y || Infinity,
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

  render () {
    const items = (this.state.items || []).filter(item => !!this.state.widgets[item.i])
    return (
      <ReactGridLayout
          {...this.props}
          layouts={this.state.layouts}
          onLayoutChange={this.onLayoutChange}
          onBreakpointChange={this.onBreakpointChange}
          measureBeforeMount={this.props.measureBeforeMount}
          useCSSTransforms={this.state.mounted}>
          {items.map(item => {
            const widget = this.state.widgets[item.i]
            const {componentKey, ...widgetProps} = widget
            const Component = this.props.components[componentKey]
            const wProps = {
              ...widgetProps,
              ...widgetProps.persist,
              // widget: widgetProps.persist, // QUESTION: do we need this?
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
