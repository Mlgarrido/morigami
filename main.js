const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to control shortcuts
const globalShortcut = electron.globalShortcut
// Module to control ipc channels
const ipcMain = electron.ipcMain
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    frame:false,
    toolbar: false
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.maximize();
  //mainWindow.setFullScreen(true);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null
  });

  // Libs
  // Controller
  var controller = require('./controller/controller.js');
  controller.setExtras({
    'app': app,
    'mainWindow': mainWindow,
    'globalShortcut': globalShortcut
  });

  // Apps
  var apps = require('./app/controllers/apps.controller.js');
  apps.initialize(app, ipcMain, mainWindow);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('will-quit', () => {
  controller.disconnect();

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.commandLine.appendSwitch('ignore-gpu-blacklist');
//app.disableHardwareAcceleration();
