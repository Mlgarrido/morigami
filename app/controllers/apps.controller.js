var defaultConfig = require('../../config.default.json');
var fs = require('fs');

var apps = {
  app: null,
  ipcMain: null,
  mainWindow: null,
  config: defaultConfig,
  list: {}
};

apps.initialize = function(app, ipcMain, mainWindow) {
  if( app == null || !app.quit ) {
    return
  }

  if( ipcMain == null || !ipcMain.on ) {
    return
  }

  if( mainWindow == null || !mainWindow.webContents ) {
    return
  }

  apps.app = app;
  apps.mainWindow = mainWindow;

  ipcMain.on('app-list', (event, arg) => {
    console.log('App list request!');
    event.sender.send('app-list', {
      apps: apps.list
    });
  });


  var appPath = apps.app.getAppPath();

  fs.stat(appPath + '/config.json', function(err, stat) {
    if(err == null) {
      fs.readFile(appPath + '/config.json', 'utf8', function (err, data) {
        if (err) {
          console.log(err);
          apps.app.quit();
        }

        try {
          apps.config = JSON.parse(data);
          _parseConfiguration();
          _scan();
        } catch(err) {
          console.log(data);
          console.log(err);
          apps.app.quit();
        }
      });
    } else if(err.code == 'ENOENT') {
      fs.writeFile(appPath + '/config.json', JSON.stringify(defaultConfig));
      _parseConfiguration();
      _scan();
    } else {
      console.log(err);
      apps.app.quit();
    }
  });
}

function _parseConfiguration() {
  var appPath = apps.app.getAppPath();
  var appsPath = apps.config.apps.path.replace('{$app}', appPath);

  if (!fs.existsSync(appsPath)){
    fs.mkdirSync(appsPath);
  }

  apps.config.apps.path = appsPath;
}

function _scan() {
  var files = fs.readdirSync(apps.config.apps.path);
  files.forEach(function(file) {
    _checkApp(file)
  });

  setTimeout(_scan, 5000);
}

function _checkApp(appFolder) {
  var extension = _getExtension(appFolder);

  if( extension != 'mor' ) {
    console.log(appFolder + ' has invalid extension!');
    return;
  }

  var requiredFiles = [
    'config.json',
    'icon.png',
    'background.jpg',
    'index.html'
  ];

  for( var i in requiredFiles ) {
    if (!fs.existsSync(apps.config.apps.path + '/' + appFolder + '/' + requiredFiles[i])){
      console.log(appFolder + ' "' + requiredFiles[i] + '" file has not encountred!');
      return;
    }
  }

  fs.readFile(apps.config.apps.path + '/' + appFolder + '/config.json', 'utf8', function (err, data) {
    if (err) {
      console.log(appFolder + ' error on read configuration file!');
    }

    try {
      var appConfig = JSON.parse(data);
      var requiredProperties = [
        'id',
        'name'
      ]

      for( var i in requiredProperties ) {
        if( !(requiredProperties[i] in appConfig) ) {
          console.log(appFolder + ' missing "' + requiredProperties[i] + '" in configuration file!');
          return
        }
      }

      var app = {
        'path': apps.config.apps.path + '/' + appFolder + '/',
        'id': appConfig.id,
        'name': appConfig.name
      }

      _addApp(app);
    } catch(err) {
      console.log(appFolder + ' configuration file contains an invalid JSON!');
    }
  });
}

function _getExtension(filename) {
    var ext = filename.split('.');
    return ext[ext.length - 1];
}

function _addApp (app) {
  fs.readFile(app.path + '/icon.png', function(err, data){
    var icon_b64 = new Buffer(data, 'binary').toString('base64');
    app.icon = icon_b64;

    fs.readFile(app.path + '/background.jpg', function(err, data){
      var background_b64 = new Buffer(data, 'binary').toString('base64');
      app.background = background_b64;

      if( apps.mainWindow != null ) {
        if( app.id in apps.list ) {
          var diffs = false;

          for( var i in apps.list[app.id] ) {
            if( apps.list[app.id][i] != app[i] ) {
              diffs = true;
            }
          }

          if( diffs == true ) {
            apps.mainWindow.webContents.send('app-updated', {
              app: app
            });
          }
        } else {
          apps.mainWindow.webContents.send('app-added', {
            app: app
          });
        }
      }

      apps.list[app.id] = app;
    });
  });
}

module.exports = apps;
