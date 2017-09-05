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
    var breakpoint = _reactGridLayout.Responsive.utils.getBreakpointFromWidth(props.breakpoints, props.width);
    var items = layouts[breakpoint] || [];
    if (!items.length) {
      var sortedBreakpoints = _reactGridLayout.Responsive.utils.sortBreakpoints(props.breakpoints).reverse();
      sortedBreakpoints.forEach(function (size) {
        if (layouts[size] && !items.length) items = layouts[size];
      });
    }

    _this.state = {
      mounted: false,
      layouts: layouts,
      items: items || [],
      widgets: props.widgets || {}
    };
    return _this;
  }

  _createClass(WidgetGrid, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.setState({ mounted: true });
    }
  }, {
    key: 'getNextPosition',
    value: function getNextPosition(_ref) {
      var w = _ref.w,
          h = _ref.h;

      var items = this.state.layouts[this.state.breakpoint] || [];
      var x = -1,
          y = 0,
          position = void 0;
      var cols = this.state.cols;

      var _loop = function _loop() {
        ++x;
        if (x + w > cols) {
          x = 0;
          ++y;
        }
        var subject = { x: x, y: y, w: w, h: h };
        var collides = false;
        items.forEach(function (item) {
          if (_reactGridLayout.utils.collides(subject, item)) {
            collides = true;
          }
        });
        if (!collides) {
          position = subject;
        }
      };

      while (!position) {
        _loop();
      }
      return position;
    }
  }, {
    key: 'getValidItems',
    value: function getValidItems() {
      var _this2 = this;

      return (this.state.items || []).filter(function (item) {
        return !!_this2.state.widgets[item.i];
      }).filter(function (item) {
        var widget = _this2.state.widgets[item.i];
        return !!_this2.props.components[widget.componentKey];
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement(
        ReactGridLayout,
        _extends({}, this.props, {
          layouts: this.state.layouts,
          onLayoutChange: this.onLayoutChange,
          onBreakpointChange: this.onBreakpointChange,
          measureBeforeMount: false,
          useCSSTransforms: this.state.mounted }),
        this.getValidItems().map(function (item) {
          var widget = _this3.state.widgets[item.i];

          var componentKey = widget.componentKey,
              widgetProps = _objectWithoutProperties(widget, ['componentKey']);

          var Component = _this3.props.components[componentKey];
          var wProps = {
            widget: widgetProps,
            item: item,
            common: _this3.props.common
          };

          var container = _this3.props.widgetContainer || defaultWidgetContainer;

          return container(_extends({}, wProps, {
            remove: function remove() {
              return _this3.remove(item.i);
            },
            children: Component ? _react2.default.createElement(Component, _extends({}, wProps, { updateWidget: function updateWidget(props) {
                return _this3.updateWidget(item.i, props);
              } })) : item.i
          }));
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
  locked: _propTypes2.default.bool,
  widgetContainer: _propTypes2.default.func,
  common: _propTypes2.default.object,
  breakpoints: _propTypes2.default.object,
  width: _propTypes2.default.number
};
WidgetGrid.defaultProps = {
  className: "layout",
  breakpoints: { xl: 1800, lg: 1400, md: 1200, sm: 768, xs: 480, xxs: 0 },
  cols: { xl: 10, lg: 8, md: 5, sm: 4, xs: 2, xxs: 1 },
  rowHeight: 100,
  onLayoutChange: function onLayoutChange() {},
  common: {}
};

var _initialiseProps = function _initialiseProps() {
  var _this4 = this;

  this.onBreakpointChange = function (breakpoint, cols) {
    _this4.setState({ breakpoint: breakpoint, cols: cols });
  };

  this.onLayoutChange = function (layout, layouts) {
    _this4.setState({ layouts: layouts });
    _this4.onChange(layouts, _this4.state.widgets);
  };

  this.addWidget = function (gridItem, componentKey) {
    var widget = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _this4.addWidgets([{ gridItem: gridItem, componentKey: componentKey, widget: widget }]);
  };

  this.addWidgets = function () {
    var widgetConfigs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var _state = _this4.state,
        items = _state.items,
        widgets = _state.widgets;

    widgetConfigs.forEach(function (obj) {
      var _obj$gridItem = obj.gridItem,
          _obj$gridItem$w = _obj$gridItem.w,
          w = _obj$gridItem$w === undefined ? 1 : _obj$gridItem$w,
          _obj$gridItem$h = _obj$gridItem.h,
          h = _obj$gridItem$h === undefined ? 2 : _obj$gridItem$h,
          _obj$gridItem$i = _obj$gridItem.i,
          i = _obj$gridItem$i === undefined ? generateUUID() : _obj$gridItem$i;

      var validPosition = _this4.getNextPosition({ w: w, h: h });

      items = items.concat(_extends({}, obj.gridItem, {
        i: i,
        x: validPosition.x,
        y: validPosition.y,
        w: w,
        h: h
      }));
      widgets = _extends({}, widgets, _defineProperty({}, i, _extends({}, obj.widget || {}, {
        componentKey: obj.componentKey
      })));
    });
    _this4.setState({ items: items, widgets: widgets });
  };

  this.remove = function (i) {
    var index = -1;
    _this4.state.items.forEach(function (item, pos) {
      if (item.i === i) index = pos;
    });

    if (index === -1) return;

    var items = _this4.state.items;

    items.splice(index, 1);
    var widgets = _this4.state.widgets;
    delete widgets[i];
    _this4.setState({ items: items, widgets: widgets });
  };

  this.updateWidget = function (i, props) {
    var widgets = _extends({}, _this4.state.widgets, _defineProperty({}, i, _extends({}, _this4.state.widgets[i], props)));
    _this4.setState({ widgets: widgets });
    _this4.onChange(_this4.state.layouts, widgets);
  };

  this.onChange = function (layouts, widgets) {
    if (_this4.props.onChange) {
      _this4.props.onChange(layouts, widgets);
    }
  };
};

exports.default = WidgetGrid;


function defaultWidgetContainer(_ref2) {
  var item = _ref2.item,
      common = _ref2.common,
      children = _ref2.children,
      remove = _ref2.remove;

  return _react2.default.createElement(
    'div',
    { key: item.i, 'data-grid': item, style: { border: '1px solid black' } },
    common.locked ? null : _react2.default.createElement(
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
  common: _propTypes2.default.object,
  children: _propTypes2.default.node,
  remove: _propTypes2.default.func
};