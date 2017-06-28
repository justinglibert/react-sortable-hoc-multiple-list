'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.distanceRect = distanceRect;
exports.closestRect = closestRect;
exports.getDelta = getDelta;
exports.updateDistanceBetweenContainers = updateDistanceBetweenContainers;

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function distanceRect(x, y, rect) {
  var dx = x - (0, _utils.clamp)(x, rect.left, rect.right);
  var dy = y - (0, _utils.clamp)(y, rect.top, rect.bottom);

  return Math.sqrt(dx * dx + dy * dy);
}

function closestRect(x, y, containers) {
  var distances = containers.map(function (c) {
    return distanceRect(x, y, c.getBoundingClientRect());
  });
  return distances.indexOf(Math.min.apply(Math, (0, _toConsumableArray3.default)(distances)));
}

function getDelta(rect1, rect2) {
  return {
    x: rect1.left - rect2.left,
    y: rect1.top - rect2.top
  };
}

function updateDistanceBetweenContainers(distance, container1, container2) {
  var x = distance.x,
      y = distance.y;

  var d = getDelta.apply(undefined, (0, _toConsumableArray3.default)([container1, container2].map(function (c) {
    return c.container.getBoundingClientRect();
  })));

  return {
    x: x + d.x,
    y: y + d.y
  };
}