import BasicAdapter from "./basic";
import Ember from 'ember';
const { on, computed } = Ember;

export default BasicAdapter.extend({
  name: 'bookmarklet',

  inspectedWindow: computed(function() {
    return window.opener || window.parent;
  }),

  inspectedWindowURL: computed(function() {
    return loadPageVar('inspectedWindowURL');
  }),

  sendMessage(options) {
    options = options || {};
    this.get('inspectedWindow').postMessage(options, this.get('inspectedWindowURL'));
  },

  _connect: on('init', function() {

    window.addEventListener('message', e => {
      let message = e.data;
      if (e.origin !== this.get('inspectedWindowURL')) {
        return;
      }
      // close inspector if inspected window is unloading
      if (message && message.unloading) {
        window.close();
      }
      if (message.from === 'inspectedWindow') {
        this._messageReceived(message);
      }
    });
    console.log("here");
    this.onMessageReceived(message => {
      console.log('version');
      let { name, version } = message;
      if (name === 'version' && +version.split('.')[0] < 2) {
        this.sendMessage({ name: 'switch-ember-debug' });
        window.location.href = 'panes-1/index.html' + window.location.search;
      }
    });
    this.sendMessage({ name: 'send-version' });

  })
});


function loadPageVar (sVar) {
  return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}
