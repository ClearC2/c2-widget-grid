'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactGridLayout = require('react-grid-layout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactGridLayout = (0, _reactGridLayout.WidthProvider)(_reactGridLayout.Responsive);

function generateUUID() {
  var d = new Date().getTime();
  if (typeof window.performance !== 'undefined' && typeof window.performance.now === 'function') {
    d += window.performance.now();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
}

var WidgetGrid = function (_Component) {
  _inherits(WidgetGrid, _Component);

  function WidgetGrid(props) {
    _classCallCheck(this, WidgetGrid);

    var _this = _possibleConstructorReturn(this, (WidgetGrid.__proto__ || Object.getPrototypeOf(WidgetGrid)).call(this, props));

    _initialiseProps.call(_this);

    var layouts = props.layouts || {};
    var items = [];
    Object.keys(layouts).forEach(function (size) {
      if (layouts[size].length) items = layouts[size];
    });

    _this.state = {
      mounted: false,
      layouts: layouts,
      items: items || [],
      widgets: props.widgets || {},
      gridInitialized: false
    };
    return _this;
  }

  _createClass(WidgetGrid, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.setState({ mounted: true });
      if (this.props.getGrid) this.props.getGrid(this);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var items = (this.state.items || []).filter(function (item) {
        return !!_this2.state.widgets[item.i];
      });
      return _react2.default.createElement(
        ReactGridLayout,
        _extends({
          ref: 'grid'
        }, this.props, {
          layouts: this.state.layouts,
          onLayoutChange: this.onLayoutChange,
          measureBeforeMount: true,
          isDraggable: !this.props.locked,
          isResizable: !this.props.locked }),
        items.map(function (item) {
          var widget = _this2.state.widgets[item.i];

          var componentKey = widget.componentKey,
              widgetProps = _objectWithoutProperties(widget, ['componentKey']);

          var Component = _this2.props.components[componentKey];
          var wProps = _extends({}, widgetProps, {
            locked: _this2.props.locked,
            size: { w: item.w, h: item.h }
          });

          var container = _this2.props.widgetContainer || defaultWidgetContainer;

          return container({
            item: item,
            locked: _this2.props.locked,
            remove: function remove() {
              return _this2.remove(item.i);
            },
            children: Component ? _react2.default.createElement(Component, _extends({}, wProps, { updateWidget: function updateWidget(props) {
                return _this2.updateWidget(item.i, props);
              } })) : item.i
          });
        })
      );
    }
  }]);

  return WidgetGrid;
}(_react.Component);

WidgetGrid.propTypes = {
  components: _propTypes2.default.object,
  onChange: _propTypes2.default.func,
  layouts: _propTypes2.default.object,
  widgets: _propTypes2.default.object,
  getGrid: _propTypes2.default.func,
  locked: _propTypes2.default.bool,
  widgetContainer: _propTypes2.default.func
};
WidgetGrid.defaultProps = {
  className: "layout",
  breakpoints: { xl: 1800, lg: 1400, md: 1200, sm: 768, xs: 480, xxs: 0 },
  cols: { xl: 10, lg: 8, md: 5, sm: 4, xs: 2, xxs: 1 },
  rowHeight: 100,
  onLayoutChange: function onLayoutChange() {}
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.onLayoutChange = function (layout, layouts) {
    _this3.setState({ layouts: layouts });
    _this3.props.onChange(layouts, _this3.state.widgets);
  };

  this.addWidget = function (gridItem, widget) {
    var x = gridItem.x,
        y = gridItem.y,
        _gridItem$w = gridItem.w,
        w = _gridItem$w === undefined ? 1 : _gridItem$w,
        _gridItem$h = gridItem.h,
        h = _gridItem$h === undefined ? 2 : _gridItem$h,
        _gridItem$i = gridItem.i,
        i = _gridItem$i === undefined ? generateUUID() : _gridItem$i;

    _this3.setState({
      items: _this3.state.items.concat(_extends({}, gridItem, {
        i: i,
        x: x || _this3.state.items.length * h % (_this3.state.cols || 12),
        y: y || Infinity,
        w: w,
        h: h
      })),
      widgets: _extends({}, _this3.state.widgets, _defineProperty({}, i, widget))
    });
  };

  this.remove = function (i) {
    var index = -1;
    _this3.state.items.forEach(function (item, pos) {
      if (item.i === i) index = pos;
    });

    if (index === -1) return;

    var items = _this3.state.items;

    items.splice(index, 1);
    var widgets = _this3.state.widgets;
    delete widgets[i];
    _this3.setState({ items: items, widgets: widgets });
  };

  this.updateWidget = function (i, props) {
    var widgets = _extends({}, _this3.state.widgets, _defineProperty({}, i, _extends({}, _this3.state.widgets[i], props)));
    _this3.setState({ widgets: widgets });
    _this3.props.onChange(_this3.state.layouts, widgets);
  };
};

exports.default = WidgetGrid;


function defaultWidgetContainer(_ref) {
  var item = _ref.item,
      locked = _ref.locked,
      children = _ref.children,
      remove = _ref.remove;

  return _react2.default.createElement(
    'div',
    { key: item.i, 'data-grid': item, style: { border: '1px solid black' }, className: 'widget-container' },
    locked ? null : _react2.default.createElement(
      'div',
      { style: { clear: 'both', textAlign: 'right' } },
      _react2.default.createElement(
        'a',
        { onClick: remove, className: 'pointer' },
        '\xD7 \xA0'
      )
    ),
    children
  );
}

defaultWidgetContainer.propTypes = {
  item: _propTypes2.default.object,
  locked: _propTypes2.default.bool,
  children: _propTypes2.default.node,
  remove: _propTypes2.default.func
};