# C2 Widget Grid

C2 Widget Grid is a wrapper around [react-grid-layout](https://github.com/STRML/react-grid-layout) to support responsive, saveable, widget(component) grids.

## Installation

Install C2 Widget Grid using npm:

```bash
npm install -S c2-widget-grid
```

And include the supporting css files in your application(according to the react-grid-layout package):

```
import '../../node_modules/react-grid-layout/css/styles.css'
import '../../node_modules/react-resizable/css/styles.css'
```

## Usage

Example usage looks like the following

```js
import WidgetGrid from 'c2-widget-grid'

class Dashboard extends Component {
  addWidget = () => {
    this.grid.addWidget({w: 2, h: 2}, 'ContactList', {company: 'abc123'})
  }

  render () {
    return (
      <WidgetGrid
        ref={grid => this.grid = grid}
        layouts={layouts} // retrieved from localStorage/redux
        widgets={widgets} // retrieved from localStorage/redux
        components={{ContactList, PerformanceChart}}
        onChange={(layouts, widgets) => save({layouts, widgets})} // save to localStorage/redux
        common={{
          loginId: 'foobar'
          locked: this.state.locked
        }}
        isDraggable={!this.state.locked}
        isResizable={!this.state.locked}
      />
    )
  }
}
```

The values inside the `layouts` and `widgets` props will be managed by c2-widget-grid. You are responsible for persisting and fetching those values. The `onChange`
prop function will be called when either the `layouts` or the `widgets` change.

### Adding widgets
After the grid/widgets are built from the initial `layouts` and `widgets` props, they can be added via the grid's `addWidget` method.
The first argument is the props for the grid item([see grid item props](https://github.com/STRML/react-grid-layout/blob/master/README.md#grid-item-props)). The second
argument is the component key. This must match a key found in the `components` that were assigned to the `WidgetGrid`. configuration for the widget. `ContactList` and `PerformanceChart` are component classes in the example above. The last argument is an object of props that are specific to this widget. This will be passed to the component as the `widget` prop.

### Widget components
A widget component will be passed 4 props: `item`, `widget`, `common`, and `updateWidget`.
 - `item` - this is the react-grid-layout item object. It contains things like w, h, x, y, etc.
 - `widget` - this is an object containing all arbitrary props you passed into the third argument of `addWidget()`.
 - `common` - `WidgetGrid` accepts a `common` prop. This object will be passed along to all widget components.
 - `updateWidget` - this is a function that allows you to update the `widget` prop. It works very similarly to `setState`. It exists to trigger the `onChange` function so new values can be persisted.

### Removing widgets
By default, the following renderer is used to render the container for all widgets. This can be set via the `widgetContainer` prop on the grid. For technical reasons, this must be a function that returns jsx.

```js
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
```

## Example
This project contains a working example illustrating usage of most of the features.
