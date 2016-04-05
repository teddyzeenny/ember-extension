/**
 * The adapter stores logic specific to each environment.
 * Extend this object with env specific code (such as chrome/firefox/test),
 * then set the application's `adapter` property to the name of this adapter.
 *
 * example:
 *
 * ```javascript
 * const EmberInspector = App.Create({
 *   adapter: 'chrome'
 * });
 * ```
 */
import Ember from "ember";
const { computed, K } = Ember;
import config from 'ember-inspector/config/environment';
const EMBER_VERSION_SUPPORTED = config.emberVersionSupported;

export default Ember.Object.extend({
  init() {
    this._super(...arguments);
    this._checkVersion();
  },

  _checkVersion() {
    this.onMessageReceived(message => {
      let { name, version } = message;
      if (name === 'version-mismatch' && +version.split('.')[0] < EMBER_VERSION_SUPPORTED) {
        this.onVersionMismatch();
      }
    });
    this.sendMessage({ name: 'check-version' });
  },

  onVersionMismatch: K,

  name: 'basic',
  /**
    Used to send messages to EmberDebug

    @param type {Object} the message to the send
  **/
  sendMessage() {},

  /**
    Register functions to be called
    when a message from EmberDebug is received
  **/
  onMessageReceived(callback) {
    this.get('_messageCallbacks').pushObject(callback);
  },

  _messageCallbacks: computed(function() { return []; }),

  _messageReceived(message) {
    this.get('_messageCallbacks').forEach(callback => {
      callback(message);
    });
  },

  // Called when the "Reload" is clicked by the user
  willReload: K,

  canOpenResource: false,
  openResource(/* file, line */) {}

});
