import PortMixin from 'mixins/port_mixin';
import DataAdapter from "data_adapter";

var classify = Ember.String.classify, get = Ember.get;


var DataDebug = Ember.Object.extend(PortMixin, {
  init: function() {
    this._super();
    this.sentTypes = {};
    this.sentRecords = {};
    if(window.DS) {
      this.adapter = DataAdapter.create({ application: this.get('application') });
    }
  },

  sentTypes: {},
  sentRecords: {},

  adapter: null,

  namespace: null,

  port: Ember.computed.alias('namespace.port'),
  application: Ember.computed.alias('namespace.application'),
  objectInspector: Ember.computed.alias('namespace.objectInspector'),

  portNamespace: 'data',

  modelTypesReceived: function(types) {
    var self = this, objectId, typesToSend;
    typesToSend = types.map(function(type) {
      objectId = Ember.guidFor(type);
      return self.wrapType(type);
    });
    this.sendMessage('modelTypes', {
      modelTypes: typesToSend
    });
  },

  modelTypeUpdated: function(type) {
    var objectId = Ember.guidFor(type);
    this.sendMessage('modelTypeUpdated', {
      modelType: this.wrapType(type)
    });
  },

  wrapType: function(type) {
    var objectId = Ember.guidFor(type);
    this.sentTypes[objectId] = type;

    return {
      columns: type.columns,
      count: type.count,
      name: type.name,
      objectId: objectId
    };
  },

  reset: function() {
    var type;
    for (var i in this.sentTypes) {
      type = this.sentTypes[i];
      type.release();
    }
  },

  messages: {
    getModelTypes: function() {
      this.adapter.getModelTypes(this, this.modelTypesReceived, this.modelTypeUpdated);
    },

    clearTypes: function() {
      this.sentTypes = {};
    },

    reset: function() {
      this.reset();
    },

    getRecords: function(message) {
      var type = this.sentTypes[message.objectId], self = this, records;
      records = this.adapter.getRecords(type.object).map(function(record) {
        var objectId = Ember.guidFor(record.object);
        self.sentRecords[objectId] = record;
        return {
          columnValues: record.columnValues,
          objectId: objectId
        };
      });
      this.sendMessage('records', {
        records: records
      });
    },

    inspectModel: function(message) {
      this.get('objectInspector').sendObject(this.sentRecords[message.objectId].object);
    }
  }
});

export default DataDebug;
