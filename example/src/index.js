import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {render} from 'react-dom'
import WidgetGrid from '../../src/components/WidgetGrid'
import '../../node_modules/react-grid-layout/css/styles.css'
import '../../node_modules/react-resizable/css/styles.css'

let lsGrid = getFromLS('grid') || {}
lsGrid = JSON.parse(JSON.stringify(lsGrid))

class Example extends Component {
  constructor (props) {
    super(props)
    this.state = {locked: false}
  }

  render () {
    return (
      <div>
        <div className="row" style={{marginTop: '40px'}}>
          <div className="col-xs-2 col-xs-offset-1">
            <form onSubmit={e => {
              e.preventDefault()
              const gridItem = {
                w: this.state.width || 1,
                h: this.state.height || 1
              }
              this.grid.addWidget(gridItem, (this.state.widget || 'Foo'), {persist: {text: 'some text'}, name: 'Nick'})
            }}>
              <div className="form-group">
                <label>Widget</label>
                <select className="form-control" onChange={e => this.setState({widget: e.target.value})}>
                  <option>Foo</option>
                  <option>Bar</option>
                </select>
              </div>
              <div className="form-group">
                <label>Width</label>
                <select className="form-control" onChange={e => this.setState({width: Number(e.target.value)})}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
              </div>
              <div className="form-group">
                <label>Height</label>
                <select className="form-control" onChange={e => this.setState({height: Number(e.target.value)})}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
              </div>
              <div className="row">
                <div className="col-xs-6">
                  <button type="submit" className="btn btn-default">Add</button>
                </div>
                <div className="col-xs-6 text-right">
                  <button type="button" className="btn btn-warning" onClick={() => this.setState({locked: !this.state.locked})}>
                    {this.state.locked ? 'Unlock' : 'Lock'}
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="col-xs-9">
            <WidgetGrid
              ref={grid => this.grid = grid}
              layouts={lsGrid.layouts}
              widgets={lsGrid.widgets}
              components={{Foo, Bar}}
              onChange={(layouts, widgets) => {
                saveToLS('grid', {layouts, widgets})
              }}
              common={{loginId: 'foobar', locked: this.state.locked}}
              isDraggable={!this.state.locked}
              isResizable={!this.state.locked}
            />
          </div>
        </div>
      </div>
    )
  }
}

function Foo ({common}) {
  return <div>Foo - {common.loginId}</div>
}
Foo.propTypes = {common: PropTypes.object}

function Bar ({text, name, updateWidget}) {
  return (
    <div>
      <div className="row">
        <div className="col-xs-10 col-xs-offset-1">
          <input className="form-control" value={text || ''} onChange={e => updateWidget({text: e.target.value})}/>
        </div>
        <div className="col-xs-12">Hi, {name}!</div>
      </div>
    </div>
  )
}
Bar.propTypes = {
  widget: PropTypes.object,
  text: PropTypes.string,
  name: PropTypes.string,
  updateWidget: PropTypes.func
}

function getFromLS (key) {
  let ls = {}
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem('widget-grid')) || {}
    } catch (e) {/* Ignore*/}
  }
  return ls[key]
}

function saveToLS (key, value) {
  if (global.localStorage) {
    global.localStorage.setItem('widget-grid', JSON.stringify({[key]: value}))
  }
}

render(
  <Example/>,
  document.getElementById('app')
)
