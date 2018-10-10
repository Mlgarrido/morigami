var config = require('./config.json');

var controller = {
  app: null,
  mainWindow: null,
  globalShortcut: null
};

controller.setExtras = function (options) {
  if( 'app' in options ) {
    controller.app = options.app;

    controller.app.on('ready', _configureKeyboard);
  }

  if( 'mainWindow' in options ) {
    controller.mainWindow = options.mainWindow;
  }

  if( 'globalShortcut' in options ) {
    controller.globalShortcut = options.globalShortcut;

    if(controller.app.isReady()) {
      _configureKeyboard();
    }
  }
}

// Keyboard

function _configureKeyboard() {
  if( controller.globalShortcut != null && controller.globalShortcut != undefined ) {
    controller.globalShortcut.register(config.keyboard.actions.quit, () => {
      _onAction('keyboard', 'press', config.keyboard.actions.quit);
    });
  }
}

// Dualshock 3

var dualshock3 = require('./dualshock/libs/dualshock.js');

dualshock3.initialize({
  model : 'ds3'
});

dualshock3.on('connected', function(device) {
  console.log('New DS3 connected!');
  console.log(device);
  console.log('Devices: ' + dualshock3.devices.length);
});

dualshock3.on('error', function(error) {
  console.log(error);
});

dualshock3.on('pressButton', function(button) {
  if( controller.mainWindow != null ) {
    controller.mainWindow.webContents.send('ds3-press-button', {
      button: button
    });
  }

  _onAction('ds3', 'press', button);
});

dualshock3.on('holdButton', function(button) {
  if( controller.mainWindow != null ) {
    controller.mainWindow.webContents.send('ds3-hold-button', {
      button: button
    });
  }

  _onAction('ds3', 'hold', button);
});

dualshock3.on('analogButton', function(button) {
  if( controller.mainWindow != null ) {
    controller.mainWindow.webContents.send('ds3-analog-button', {
      button: button
    });
  }

  _onAction('ds3', 'analog', button);
});

dualshock3.on('releaseButton', function(button) {
  if( controller.mainWindow != null ) {
    controller.mainWindow.webContents.send('ds3-release-button', {
      button: button
    });
  }

  _onAction('ds3', 'release', button);
});

// Controllers

function _onAction(controllerId, type, action) {
  if( controllerId in config ) {
    switch(action) {
      case config[controllerId].actions.primary:
        action = 'primary'
        break;

      case config[controllerId].actions.secondary:
        action = 'secondary'
        break;

      case config[controllerId].actions.menu:
        action = 'menu'
        break;

      case config[controllerId].actions.move_up:
        action = 'move_up'
        break;

      case config[controllerId].actions.move_down:
        action = 'move_down'
        break;

      case config[controllerId].actions.move_left:
        action = 'move_left'
        break;

      case config[controllerId].actions.move_right:
        action = 'move_right'
        break;

      case config[controllerId].actions.quit:
        if( controller.app != null && controller.app.quit ) {
          controller.app.quit();
        }
        break;
    }
  }

  switch(type) {
    case 'press':
      if( controller.mainWindow != null ) {
        controller.mainWindow.webContents.send('morigami-action-pressed', {
          action: action
        });

        controller.mainWindow.webContents.send('morigami-action-' + action.replace('_', '') + '-pressed', {});
      }
      break;

    case 'release':
      if( controller.mainWindow != null ) {
        controller.mainWindow.webContents.send('morigami-action-release', {
          action: action
        });

        controller.mainWindow.webContents.send('morigami-action-' + action.replace('_', '') + '-release', {});
      }
      break;
  }
}

// Disconnection

controller.disconnect = function() {

}

module.exports = controller;
