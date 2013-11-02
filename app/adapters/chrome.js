import BasicAdapter from "adapters/basic";

var ChromeAdapter = BasicAdapter.extend({

  sendMessage: function(options) {
    options = options || {};
    this.get('_chromePort').postMessage(options);
  },

  _chromePort: function() {
    return chrome.extension.connect();
  }.property(),

  _connect: function() {
    var self = this;
    var chromePort = this.get('_chromePort');
    chromePort.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

    chromePort.onMessage.addListener(function(message) {
      self._messageReceived(message);
    });
  }.on('init'),

  _handleReload: function() {
    chrome.devtools.network.onNavigated.addListener(function() {
      location.reload(true);
    });
  }.on('init'),

  _injectDebugger: function() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.extension.getURL('/ember_debug/ember_debug.js'), false);
    xhr.send();
    var emberDebug = '(function() { ' + xhr.responseText + ' }());';
    chrome.devtools.inspectedWindow.eval(emberDebug);
  }.on('init')
});

export default ChromeAdapter;
