import PortMixin from "ember-debug/mixins/port-mixin";
import SourceMap from "ember-debug/libs/source-map";
var Ember = window.Ember;
var EmberObject = Ember.Object;
var computed = Ember.computed;
var readOnly = computed.readOnly;
var run = Ember.run;
var $ = Ember.$;
var guidFor = Ember.guidFor;

export default EmberObject.extend(PortMixin, {
  portNamespace: 'deprecation',

  port: readOnly('namespace.port'),

  adapter: readOnly('port.adapter'),

  deprecations: computed(function(){
    return Ember.A();
  }).property(),

  groupedDeprecations: computed(function() {
    return {};
  }).property(),

  deprecationsToSend: computed(function() {
    return Ember.A();
  }),

  sourceMap: computed(function() {
    return SourceMap.create();
  }).property(),

  // Keep an eye on https://github.com/ember-cli/ember-cli/issues/3045
  emberCliConfig: computed(function() {
    var config;
    $('meta[name]').each(function() {
      var meta = $(this);
      var match = meta.attr('name').match(/environment$/);
      if (match) {
        try {
          /* global unescape */
          config = JSON.parse(unescape(meta.attr('content')));
          return false;
        } catch (e) {}
      }
    });
    return config;
  }).property(),

  init: function() {
    this._super();
    this.replaceDeprecate();
  },

  /**
   * Checks if ember-cli and looks for source maps.
   */
  fetchSourceMap: function(stackStr) {
    var self = this;
    if (this.get('emberCliConfig') && this.get('emberCliConfig.environment') === 'development') {
      var mapped = this.get('sourceMap').map(stackStr);
      var source = mapped.find(function(item) {
        return !!item.source.match(new RegExp(self.get('emberCliConfig.modulePrefix')));
      });
      return source;
    }
  },

  sendPending: function() {
    var self = this;
    var deprecations = Ember.A();
    this.get('deprecationsToSend').forEach(function(deprecation) {
      var obj;
      self.get('deprecations').pushObject(deprecation);
      var grouped = self.get('groupedDeprecations');
      var id = guidFor(deprecation.message);
      obj = grouped[id];
      if (obj) {
        obj.count++;
      } else {
        obj = deprecation;
        obj.count = 1;
        obj.id = id;
        obj.sources = Ember.A();
        grouped[id] = obj;
      }
      var found = obj.sources.findBy('stackStr', deprecation.stackStr);
      if (!found) {
        var map = self.fetchSourceMap(deprecation.stackStr);
        obj.sources.pushObject({
          map: map,
          stackStr: deprecation.stackStr
        });
        if (map) {
          obj.hasSourceMap = true;
        }
      }
      delete obj.stackStr;
      deprecations.addObject(obj);
    }, this);

    this.sendMessage('deprecationsAdded', {
      deprecations: deprecations
    });

    this.get('deprecationsToSend').clear();
    this.sendCount();
  },

  sendCount: function() {
    this.sendMessage('count', {
      count: this.get('deprecations.length')
    });
  },

  messages: {
    watch: function() {
      var grouped = this.get('groupedDeprecations');
      var deprecations = [];
      for (var i in grouped) {
        if (!grouped.hasOwnProperty(i)) {
          continue;
        }
        deprecations.push(grouped[i]);
      }
      this.sendMessage('deprecationsAdded', {
        deprecations: deprecations
      });
    },

    sendStackTraces: function(message) {
      var deprecation = message.deprecation;
      deprecation.sources.forEach(function(source) {
        var stack = source.stackStr;
        stack = stack.split('\n');
        stack.unshift('Ember Inspector (Deprecation Trace): ' + (deprecation.message || ''));
        this.get('adapter').log(stack.join('\n'));
      }, this);
    },

    getCount: function() {
      this.sendCount();
    }

  },

  willDestroy: function() {
    Ember.deprecate = this.originalDeprecate;
    this.originalDeprecate = null;
    run.cancel(this.debounce);
    this._super();
  },

  replaceDeprecate: function() {
    var self = this;
    var originalDeprecate = this.originalDeprecate = Ember.deprecate;

    Ember.deprecate = function(message, test, options) {
      /* global __fail__*/
      // Code taken from https://github.com/emberjs/ember.js/blob/master/packages/ember-debug/lib/main.js
      var noDeprecation;

      if (typeof test === 'function') {
        noDeprecation = test();
      } else {
        noDeprecation = test;
      }

      if (noDeprecation) { return; }

      var error;

      // When using new Error, we can't do the arguments check for Chrome. Alternatives are welcome
      try { __fail__.fail(); } catch (e) { error = e; }

      var stack;
      var stackStr = '';
      if (error.stack) {

        // var stack;
        if (error['arguments']) {
          // Chrome
          stack = error.stack.replace(/^\s+at\s+/gm, '').
          replace(/^([^\(]+?)([\n$])/gm, '{anonymous}($1)$2').
          replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}($1)').split('\n');
          stack.shift();
        } else {
          // Firefox
          stack = error.stack.replace(/(?:\n@:0)?\s+$/m, '').
          replace(/^\(/gm, '{anonymous}(').split('\n');
        }

        stackStr = "\n    " + stack.slice(2).join("\n    ");
      }

      var url;
      if (arguments.length === 3 && options && typeof options === 'object') {
        url = options.url;
      }

      var deprecation = {
        message: message,
        stackStr: stackStr,
        url: url
      };

      self.get('deprecationsToSend').pushObject(deprecation);
      self.debounce = run.debounce(self, 'sendPending', 100);
      return originalDeprecate.apply(null, arguments);
    };
  }

});

