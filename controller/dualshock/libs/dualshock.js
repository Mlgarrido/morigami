var dualshock = {
  devices: [],
  callbacks: {},
  config: ''
};

var utils = require('./utils.js');
var buttons = require('./buttons.js');

dualshock.initialize = function(options) {
  dualshock.options = options;

  if( 'model' in dualshock.options ) {
    if( dualshock.options.model == 'ds3' ) {
      dualshock.config = require('./configs/ds3.config.json');
    } else {
      dualshock.config = require('./configs/ds3.config.json');
    }
  } else {
    dualshock.config = require('./configs/ds3.config.json');
  }

  buttons.setExtras({
    callbacks: dualshock.callbacks,
    config: dualshock.config
  });

  _scan();
}

dualshock.on = function(action, callback) {
  dualshock.callbacks[action] = callback;
}

function _scan() {
  var HID = require('node-hid');
  var devices = HID.devices();

  for( i in devices ) {
    var device = devices[i];

    if( device.vendorId == dualshock.config.vendorId && device.productId == dualshock.config.productId ) {
        if(!_deviceExists(device.serialNumber) && device.serialNumber != '') {
          var connection = new HID.HID(device.path);
          device = {
            data: device,
            connection: connection
          };
          dualshock.devices.push(device);

          // Show led
          var led = 2;
          switch(dualshock.devices.length) {
            case 1:
              led = 2;
              break;

            case 2:
              led = 4;
              break;

            case 3:
              led = 8;
              break;

            case 4:
              led = 16;
              break;

            default:
              led = 2;
              break;
          }

          let buff = dualshock.config.output.defaultBuffer.slice();

          buff[dualshock.config.output.indexes['led']] = led;
          device.connection.write(buff);

          // Configure callbacks
          if( 'connected' in dualshock.callbacks ) {
            if( utils._isFunction(dualshock.callbacks.connected)  ) {
              dualshock.callbacks.connected(device);
            }
          }

          device.connection.on('data', function(data) {
            buttons.processData(data);

            if( 'data' in dualshock.callbacks ) {
              if( utils._isFunction(dualshock.callbacks.data)  ) {
                dualshock.callbacks.data(data);
              }
            }
          });

          device.connection.on('error', function(err) {
            if( 'error' in dualshock.callbacks ) {
              if( utils._isFunction(dualshock.callbacks.error)  ) {
                dualshock.callbacks.error(err);
              }
            }
          });
        }
    }
  }

  setTimeout(function(){
    _scan();
  }, 1000);
}

function _deviceExists(serial) {
  for( i in dualshock.devices ) {
    var device = dualshock.devices[i];

    if( device.data.serialNumber == serial ) {
      return true;
    }
  }

  return false;
}

module.exports = dualshock;
