var controller = require('./controller.renderer.js');

var ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.send('app-list');

var apps = [];

ipcRenderer.on('app-list', function (event, data) {
  for( var i in data.apps ) {
    _addApp(data.apps[i]);
  }
});

ipcRenderer.on('app-added', function (event, data) {
  _addApp(data.app);
});

var selected = 0;
var opened = false;

function _addApp(app) {
  var mock = $('#app-mock > .app').html();
  var appElement = $('<div></div>').addClass('app').attr('id', 'app-' + app.id.replace(/\./g, '')).html(mock);

  $(appElement).find('div').first().css('background', 'url(data:image/png;base64,' + app.background + ') no-repeat fixed center');
  $(appElement).find('.app-icon').attr('src', 'data:image/png;base64,' + app.icon);
  $(appElement).find('.app-name').html(app.name);

  if( selected == apps.length ) {
    $('.app').removeClass('selected');
    $(appElement).addClass('selected');
  }

  $('#apps-list').append(appElement);
  apps.push(app);
}

ipcRenderer.on('app-updated', function (event, data) {
  _updateApp(data.app);
});

function _updateApp(app) {
}

// Movement

controller.on('primary', 'press', function() {
  if( opened == false ) {
    _openApp();
  }

  webview.sendInputEvent({
    type: 'keyDown',
    keyCode: 'Space'
  });
});

controller.on('primary', 'release', function() {
  webview.sendInputEvent({
    type: 'keyUp',
    keyCode: 'Space'
  });
});

controller.on('secondary', 'press', function() {
  if( opened == true ) {
    _closeApp();
  }
});

controller.on('start', 'press', function() {
  webview.sendInputEvent({
    type: 'keyDown',
    keyCode: 's'
  });
});

controller.on('move_up', 'press', function() {
  webview.sendInputEvent({
    type: 'keyDown',
    keyCode: 'Up'
  });
});

controller.on('move_up', 'release', function() {
  webview.sendInputEvent({
    type: 'keyUp',
    keyCode: 'Up'
  });
});

controller.on('move_down', 'press', function() {
  webview.sendInputEvent({
    type: 'keyDown',
    keyCode: 'Down'
  });
});

controller.on('move_down', 'release', function() {
  webview.sendInputEvent({
    type: 'keyUp',
    keyCode: 'Down'
  });
});

controller.on('move_left', 'press', function() {
  if( selected > 0 && opened == false ) {
    selected--;
    $('#apps-selector .ti-angle-left').css('color', 'rgba(44,43,41,0.4)');
    setTimeout(function() {
      $('#apps-selector .ti-angle-left').css('color', '#FFFFFF');
    }, 250);
    _move();
  }

  webview.sendInputEvent({
    type: 'keyDown',
    keyCode: 'Left'
  });
});

controller.on('move_left', 'release', function() {
  webview.sendInputEvent({
    type: 'keyUp',
    keyCode: 'Left'
  });
});

controller.on('move_right', 'press', function() {
  if( selected < apps.length - 1 && opened == false ) {
    selected++;
    $('#apps-selector .ti-angle-right').css('color', 'rgba(44,43,41,0.4)');
    setTimeout(function() {
      $('#apps-selector .ti-angle-right').css('color', '#FFFFFF');
    }, 250);
    _move();
  }

  webview.sendInputEvent({
    type: 'keyDown',
    keyCode: 'Right'
  });
});

controller.on('move_right', 'release', function() {
  webview.sendInputEvent({
    type: 'keyUp',
    keyCode: 'Right'
  });
});

function _move() {
  if( selected > 0 ) {
    $('#main-logo-1').css('opacity', 0);
    $('#apps-selector > div:nth-of-type(1)').css('opacity', 1);
  } else {
    $('#main-logo-1').css('opacity', 1);
    $('#apps-selector > div:nth-of-type(1)').css('opacity', 0);
  }

  if( selected < apps.length - 1 ) {
    $('#main-logo-2').css('opacity', 0);
    $('#apps-selector > div:nth-of-type(2)').css('opacity', 1);
  } else {
    $('#main-logo-2').css('opacity', 1);
    $('#apps-selector > div:nth-of-type(2)').css('opacity', 0);
  }

  for( var i=0;i < apps.length; i++ ) {
    var appElement = $('#app-' + apps[i].id.replace(/\./g, ''));
    var xPos = $(window).width()/2;
    xPos = (xPos - 150) + ((i - selected) * 310);
    $(appElement).css('left', xPos + 'px');

    if( selected == i ) {
      $('.app').removeClass('selected');
      $(appElement).addClass('selected');
    }
  }
}

function _openApp() {
  opened = true;
  $('#app-container').css('background', 'url(data:image/png;base64,' + apps[selected].background + ') no-repeat center');
  $('#app-container > webview').attr('src', 'file://' + apps[selected].path + 'index.html');
  $('#app-container').fadeIn('fast');
}

function _closeApp() {
  opened = false;
  $('#app-container').fadeOut('fast', function() {
    $('#app-container > webview').css('opacity', 0);
    $('#app-container > webview').attr('src', 'about:blank');
  });
}

// Web view states
const webview = document.querySelector('webview');

const loadstart = () => {
  $('#app-container > webview').css('opacity', 0);
}

const loadstop = () => {
  $('#app-container > webview').animate({
    opacity: 1
  }, 200, function() {

  });
}

const domReady = () => {
  //webview.openDevTools();
}

webview.addEventListener('did-start-loading', loadstart);
webview.addEventListener('did-stop-loading', loadstop);
webview.addEventListener('dom-ready', domReady);

$(document).ready(function() {
  _move();

  setTimeout(function() {
    _move();
  }, 2500);

  $(window).resize(function() {
    _move();
  });
});
