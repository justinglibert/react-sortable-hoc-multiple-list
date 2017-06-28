'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('../utils');

var _utils2 = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DragLayer = function () {
  function DragLayer() {
    var _this = this;

    (0, _classCallCheck3.default)(this, DragLayer);
    this.helper = null;
    this.lists = [];

    this.handleSortMove = function (e) {
      e.preventDefault(); // Prevent scrolling on mobile
      _this.updatePosition(e);
      _this.updateTargetContainer(e);
      if (_this.currentList) {
        _this.currentList.handleSortMove(e);
      }
    };

    this.handleSortEnd = function (e) {
      if (_this.listenerNode) {
        _utils.events.move.forEach(function (eventName) {
          return _this.listenerNode.removeEventListener(eventName, _this.handleSortMove);
        });
        _utils.events.end.forEach(function (eventName) {
          return _this.listenerNode.removeEventListener(eventName, _this.handleSortEnd);
        });
      }

      if (typeof _this.onDragEnd === 'function') {
        _this.onDragEnd();
      }
      // Remove the helper from the DOM
      if (_this.helper) {
        _this.helper.parentNode.removeChild(_this.helper);
        _this.helper = null;
        _this.currentList.handleSortEnd(e);
      }
    };
  }

  (0, _createClass3.default)(DragLayer, [{
    key: 'addRef',
    value: function addRef(list) {
      this.lists.push(list);
    }
  }, {
    key: 'removeRef',
    value: function removeRef(list) {
      var i = this.lists.indexOf(list);
      if (i !== -1) {
        this.lists.splice(i, 1);
      }
    }
  }, {
    key: 'startDrag',
    value: function startDrag(parent, list, e) {
      var _this2 = this;

      var offset = (0, _utils.getOffset)(e);
      var activeNode = list.manager.getActive();

      if (activeNode) {
        var _list$props = list.props,
            axis = _list$props.axis,
            getHelperDimensions = _list$props.getHelperDimensions,
            useWindowAsScrollContainer = _list$props.useWindowAsScrollContainer;
        var node = activeNode.node,
            collection = activeNode.collection;
        var index = node.sortableInfo.index;

        var margin = (0, _utils.getElementMargin)(node);
        var containerBoundingRect = list.container.getBoundingClientRect();
        var dimensions = getHelperDimensions({ index: index, node: node, collection: collection });

        this.width = dimensions.width;
        this.height = dimensions.height;
        this.marginOffset = {
          x: margin.left + margin.right,
          y: Math.max(margin.top, margin.bottom)
        };
        this.boundingClientRect = node.getBoundingClientRect();
        this.containerBoundingRect = containerBoundingRect;
        this.currentList = list;

        this.axis = {
          x: axis.indexOf('x') >= 0,
          y: axis.indexOf('y') >= 0
        };
        this.offsetEdge = list.getEdgeOffset(node);
        this.initialOffset = offset;
        this.distanceBetweenContainers = {
          x: 0,
          y: 0
        };

        var fields = node.querySelectorAll('input, textarea, select');
        var clonedNode = node.cloneNode(true);
        var clonedFields = [].concat((0, _toConsumableArray3.default)(clonedNode.querySelectorAll('input, textarea, select'))); // Convert NodeList to Array

        clonedFields.forEach(function (field, index) {
          return field.value = fields[index] && fields[index].value;
        });

        this.helper = parent.appendChild(clonedNode);

        this.helper.style.position = 'fixed';
        this.helper.style.top = this.boundingClientRect.top - margin.top + 'px';
        this.helper.style.left = this.boundingClientRect.left - margin.left + 'px';
        this.helper.style.width = this.width + 'px';
        this.helper.style.height = this.height + 'px';
        this.helper.style.boxSizing = 'border-box';
        this.helper.style.pointerEvents = 'none';

        this.minTranslate = {};
        this.maxTranslate = {};
        if (this.axis.x) {
          this.minTranslate.x = (useWindowAsScrollContainer ? 0 : containerBoundingRect.left) - this.boundingClientRect.left - this.width / 2;
          this.maxTranslate.x = (useWindowAsScrollContainer ? list.contentWindow.innerWidth : containerBoundingRect.left + containerBoundingRect.width) - this.boundingClientRect.left - this.width / 2;
        }
        if (this.axis.y) {
          this.minTranslate.y = (useWindowAsScrollContainer ? 0 : containerBoundingRect.top) - this.boundingClientRect.top - this.height / 2;
          this.maxTranslate.y = (useWindowAsScrollContainer ? list.contentWindow.innerHeight : containerBoundingRect.top + containerBoundingRect.height) - this.boundingClientRect.top - this.height / 2;
        }

        this.listenerNode = e.touches ? node : list.contentWindow;
        _utils.events.move.forEach(function (eventName) {
          return _this2.listenerNode.addEventListener(eventName, _this2.handleSortMove, false);
        });
        _utils.events.end.forEach(function (eventName) {
          return _this2.listenerNode.addEventListener(eventName, _this2.handleSortEnd, false);
        });

        return activeNode;
      }
      return false;
    }
  }, {
    key: 'stopDrag',
    value: function stopDrag() {
      this.handleSortEnd();
    }
  }, {
    key: 'updatePosition',
    value: function updatePosition(e) {
      var _currentList$props = this.currentList.props,
          lockAxis = _currentList$props.lockAxis,
          lockToContainerEdges = _currentList$props.lockToContainerEdges;

      var offset = (0, _utils.getOffset)(e);
      var translate = {
        x: offset.x - this.initialOffset.x,
        y: offset.y - this.initialOffset.y
      };
      this.translate = translate;
      this.delta = offset;

      if (lockToContainerEdges) {
        var _currentList$getLockP = this.currentList.getLockPixelOffsets(),
            _currentList$getLockP2 = (0, _slicedToArray3.default)(_currentList$getLockP, 2),
            minLockOffset = _currentList$getLockP2[0],
            maxLockOffset = _currentList$getLockP2[1];

        var minOffset = {
          x: this.width / 2 - minLockOffset.x,
          y: this.height / 2 - minLockOffset.y
        };
        var maxOffset = {
          x: this.width / 2 - maxLockOffset.x,
          y: this.height / 2 - maxLockOffset.y
        };

        translate.x = (0, _utils.clamp)(translate.x, this.minTranslate.x + minOffset.x, this.maxTranslate.x - maxOffset.x);
        translate.y = (0, _utils.clamp)(translate.y, this.minTranslate.y + minOffset.y, this.maxTranslate.y - maxOffset.y);
      }

      if (lockAxis === 'x') {
        translate.y = 0;
      } else if (lockAxis === 'y') {
        translate.x = 0;
      }

      this.helper.style[_utils.vendorPrefix + 'Transform'] = 'translate3d(' + translate.x + 'px,' + translate.y + 'px, 0)';
    }
  }, {
    key: 'updateTargetContainer',
    value: function updateTargetContainer(e) {
      var _delta = this.delta,
          pageX = _delta.pageX,
          pageY = _delta.pageY;

      var closest = this.lists[(0, _utils2.closestRect)(pageX, pageY, this.lists.map(function (l) {
        return l.container;
      }))];
      var item = this.currentList.manager.active.item;

      this.active = item;
      if (closest !== this.currentList) {
        this.distanceBetweenContainers = (0, _utils2.updateDistanceBetweenContainers)(this.distanceBetweenContainers, closest, this.currentList, {
          width: this.width,
          height: this.height
        });
        this.currentList.handleSortEnd(e, closest);
        this.currentList = closest;
        this.currentList.manager.active = (0, _extends3.default)({}, this.currentList.getClosestNode(e), {
          item: item
        });
        this.currentList.handlePress(e);
      }
    }
  }]);
  return DragLayer;
}();

exports.default = DragLayer;