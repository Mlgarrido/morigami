var buttons = {
  callbacks: {},
  config: ''
};

var utils = require('./utils.js');

var buffer = {};

var buttonsList = null;

buttons.setExtras = function(extras) {
  if( 'callbacks' in extras ) {
    buttons.callbacks = extras.callbacks;
  }

  if( 'config' in extras ) {
    buttons.config = extras.config;
  }

  buttonsList = buttons.config.buttons;
  buttonsList.forEach(function(button) {
    if (typeof button.buttonValue == "string") {
      button.buttonValue = parseInt(button.buttonValue);
    }

    if (typeof button.mask == "string") {
      button.mask = parseInt(button.mask);
    } else if (!(button.mask instanceof Number)) {
      button.mask = 0xFF;
    }

    //generate event name aliases:
    button.eventPrefixes = utils.generateEventPrefixAliases(button.name);
  });
}

buttons.processData = function(data) {
  if( buttonsList == null ) {
    return;
  }

  for( var i in buttonsList ) {
    var button = buttonsList[i];

    var block = data[button.block] & button.mask;
    var hit = (block & button.value) == button.value;
    var value = 0;
    var state = 0; // 0: up, 1: down, 2: hold

    // special case for the dualshock 4's dpadUp button as it causes the
    // lower 8 bits of it's block to be zeroed
    if (!button.value) {
      hit = !block;
    }

    // special case for dualshock 4's dpad - they are not bitmasked values as
    // they cannot be pressed together - ie. up, left and upleft are three
    // different values - upleft is not equal to up & left
    if (button.block == 5 && block < 0x08) {
        hit = block == button.value;
    }

    if (hit) {
      value = 1;

      //if the button is in the released state.
      if (!buffer[button.name]) {
        state = 1;
        buffer[button.name] = true;
        _callback(':press', button.name);
      } else {
        state = 2;
        _callback(':hold', button.name);
      }

      //send the analog data
      if (button.analogPin && data[button.analogPin]) {
        _callback(':analog', data[button.analogPin]);
      }

    } else if (buffer[button.name]) {
      //button was pressed and is not released
      buffer[button.name] = false;

      //button is no longer pressed, emit a analog 0 event.
      if (button.analogPin) {
        _callback(':analog', 0);
      }
      //emit the released event.
      _callback(':release', button.name);
    }

    /*if (controller[button.name]) {
      controller[button.name].value = value;
      controller[button.name].state = state;
    }*/
  }
}

function _callback(action, button) {
  if( action == ':press' ) {
    if( 'pressButton' in buttons.callbacks ) {
      if( utils._isFunction(buttons.callbacks.pressButton)  ) {
        buttons.callbacks.pressButton(button);
      }
    }
  } else if( action == ':hold' ) {
    if( 'holdButton' in buttons.callbacks ) {
      if( utils._isFunction(buttons.callbacks.holdButton)  ) {
        buttons.callbacks.holdButton(button);
      }
    }
  } else if( action == ':analog' ) {
    if( 'analogButton' in buttons.callbacks ) {
      if( utils._isFunction(buttons.callbacks.analogButton)  ) {
        buttons.callbacks.analogButton(button);
      }
    }
  } else if( action == ':release' ) {
    if( 'releaseButton' in buttons.callbacks ) {
      if( utils._isFunction(buttons.callbacks.releaseButton)  ) {
        buttons.callbacks.releaseButton(button);
      }
    }
  }
}

module.exports = buttons;
