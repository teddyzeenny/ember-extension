import Ember from "ember";
import BasicAdapter from "./basic";
import config from 'ember-inspector/config/environment';
const EMBER_VERSION_SUPPORTED = config.emberVersionSupported;

export default BasicAdapter.extend({
  name: 'firefox',

  init() {
    this._connect();
    return this._super(...arguments);
  },

  sendMessage(options) {
    options = options || {};
    window.parent.postMessage(options, "*");
  },

  onVersionMismatch() {
    this.sendMessage({ type: `injectEmberDebug`, version: EMBER_VERSION_SUPPORTED === 1 ? 2 : 1 });
    window.location.href = '../panes-1/index.html';
  },

  _connect() {
    // NOTE: chrome adapter sends a appId message on connect (not needed on firefox)
    //this.sendMessage({ appId: "test" });
    this._onMessage = this._onMessage.bind(this);
    window.addEventListener("message", this._onMessage, false);
  },

  _onMessage(evt) {
    if (this.isDestroyed || this.isDestroying) {
      window.removeEventListener("message", this._onMessage, false);
      return;
    }

    const message = evt.data;
    // check if the event is originated by our privileged ember inspector code
    if (evt.isTrusted) {
      if (typeof message.type === 'string' && message.type === 'iframes') {
        this._sendIframes(message.urls);
      } else {
        // We clone the object so that Ember prototype extensions
        // are applied.
        this._messageReceived(Ember.$.extend(true, {}, message));
      }
    } else {
      console.log("EMBER INSPECTOR: ignored post message", evt);
    }
  },

  _sendIframes(urls) {
    urls.forEach(url => {
      this.sendMessage({ type: 'injectEmberDebug', frameURL: url });
    });
  },

  canOpenResource: true,

  openResource(file, line) {
    this.sendMessage({
      type: 'devtools:openSource',
      url: file,
      line: line
    });
  }

});
