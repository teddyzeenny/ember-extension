import BasicAdapter from "adapters/basic";

var ChromeAdapter = BasicAdapter.extend({
  init: function() {
    this._super();
    this._connect();
  },

  sendMessage: function(options) {
    options = options || {};
    this.get('_chromePort').postMessage(options);
  },

  inspectElement: function(elem) {
    inspect(elem);
  },

  _channel: function() {
    return new MessageChannel();
  }.property(),

  _chromePort: function() {
    return this.get('_channel.port1');
  }.property(),

  _connect: function() {
    var channel = this.get('_channel'),
        self = this,
        chromePort = this.get('_chromePort');

    window.postMessage('debugger-client', [channel.port2], '*');

    chromePort.addEventListener('message', function(event) {
      var message = event.data;
      Ember.run(function() {
        self._messageReceived(message);
      });
    });

    chromePort.start();

  }
});

export default ChromeAdapter;
