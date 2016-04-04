/* globals chrome */
import BasicAdapter from "./basic";
import Ember from 'ember';
const { on, computed } = Ember;

let emberDebug = null;

export default BasicAdapter.extend({
  name: 'chrome',

  sendMessage(options) {
    options = options || {};
    this.get('_chromePort').postMessage(options);
  },

  _chromePort: computed(function() {
    return chrome.extension.connect();
  }),

  _connect: on('init', function() {
    let self = this;
    let chromePort = this.get('_chromePort');
    chromePort.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

    chromePort.onMessage.addListener(message => {
      if (typeof message.type === 'string' && message.type === 'iframes') {
        sendIframes(message.urls);
      }
      self._messageReceived(message);
    });
  }),

  _handleReload: on('init', function() {
    let self = this;
    chrome.devtools.network.onNavigated.addListener(function() {
      self._injectDebugger();
      location.reload(true);
    });
  }),

  _injectDebugger: on('init', function() {
    chrome.devtools.inspectedWindow.eval(loadEmberDebug());
    chrome.devtools.inspectedWindow.onResourceAdded.addListener(function(opts) {
      if (opts.type === 'document') {
        sendIframes([opts.url]);
      }
    });
    this.onMessageReceived((message) => {
      let { name, version } = message;
      if (name === 'version' && +version.split('.')[0] < 2) {
        window.location.href = '../panes-1/index.html';
      }
    });
  }),

  willReload() {
    this._injectDebugger();
  },

  /**
    We handle the reload here so we can inject
    scripts as soon as possible into the new page.
  */
  reloadTab() {
    chrome.devtools.inspectedWindow.reload({
      injectedScript: loadEmberDebug()
    });
  },

  canOpenResource: true,

  openResource(file, line) {
    /*global chrome */
    // For some reason it opens the line after the one specified
    chrome.devtools.panels.openResource(file, line - 1);
  }

});

function sendIframes(urls) {
  urls.forEach(url => {
    chrome.devtools.inspectedWindow.eval(loadEmberDebug(), { frameURL: url });
  });
}

function loadEmberDebug() {
  let xhr;
  if (!emberDebug) {
    xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.extension.getURL('/panes/ember_debug.js'), false);
    xhr.send();
    emberDebug = xhr.responseText;
  }
  return emberDebug;
}
