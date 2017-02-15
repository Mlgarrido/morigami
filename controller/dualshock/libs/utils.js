'use strict';
// Module dependencies.

var unique = function unique(x) {
  var result = [];
  for (var i = 0; i < x.length; i++) {
    if ((result.indexOf(x[i]) < 0)) {
      result.push(x[i]);
    }
  }
  return result;
};

//provide a few utility functions.
module.exports = {

  //reduces noise from the controller
  isWithinVariance: function(x, y, varianceThreshhold) {
    return Math.abs(x - y) > varianceThreshhold;
  },
  warn: function(message) {

  },
  generateEventPrefixAliases: function(eventPrefix) {
    return unique([
      eventPrefix,
      eventPrefix.toLowerCase()
    ]);
  },
  _isFunction: function (functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }
};
