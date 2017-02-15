var config = require('../../controller/config.json');
var controller = {};

controller._listeners = {
  'primary': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  },
  'secondary': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  },
  'start': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  },
  'menu': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  },
  'move_up': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  },
  'move_down': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  },
  'move_left': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  },
  'move_right': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  },
  'l1': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  },
  'r1': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  },
  'l2': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  },
  'r2': {
    'press': [],
    'hold': [],
    'analog': [],
    'release': []
  }
};

controller.on = function (action, type, callback) {
  controller._listeners[action][type].push(callback);
};

$(document).keydown(function(e) {
  for( var i in controller._listeners ) {
    if (e.keyCode == config.keyboard.actions[i]) {
      for( var j in controller._listeners[i]['press'] ) {
        controller._listeners[i]['press'][j]();
      }
    }
  }
});

$(document).keyup(function(e) {
  for( var i in controller._listeners ) {
    if (e.keyCode == config.keyboard.actions[i]) {
      for( var j in controller._listeners[i]['release'] ) {
        controller._listeners[i]['release'][j]();
      }
    }
  }
});

var ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('morigami-action-pressed', function (event, data) {
  for( var j in controller._listeners[data.action]['press'] ) {
    controller._listeners[data.action]['press'][j]();
  }
});

ipcRenderer.on('morigami-action-hold', function (event, data) {
  for( var j in controller._listeners[data.action]['hold'] ) {
    controller._listeners[data.action]['hold'][j]();
  }
});

ipcRenderer.on('morigami-action-release', function (event, data) {
  for( var j in controller._listeners[data.action]['release'] ) {
    controller._listeners[data.action]['release'][j]();
  }
});

module.exports = controller;
