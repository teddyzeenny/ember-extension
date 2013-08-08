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

  releaseTypesMethod: null,
  releaseRecordsMethod: null,

  adapter: null,

  namespace: null,

  port: Ember.computed.alias('namespace.port'),
  application: Ember.computed.alias('namespace.application'),
  objectInspector: Ember.computed.alias('namespace.objectInspector'),

  portNamespace: 'data',

  modelTypesAdded: function(types) {
    var self = this, objectId, typesToSend;
    typesToSend = types.map(function(type) {
      objectId = Ember.guidFor(type);
      return self.wrapType(type);
    });
    this.sendMessage('modelTypesAdded', {
      modelTypes: typesToSend
    });
  },

  modelTypesUpdated: function(types) {
    var self = this;
    var typesToSend = types.map(function(type) {
      return self.wrapType(type);
    });
    self.sendMessage('modelTypesUpdated', {
      modelTypes: typesToSend
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


  recordsAdded: function(recordsReceived) {
    var self = this, records;
    records = recordsReceived.map(function(record) {
      return self.wrapRecord(record);
    });
    self.sendMessage('recordsAdded', {
      records: records
    });
  },

  recordsUpdated: function(records) {
    var self = this;
    records.forEach(function(record) {
      var objectId = Ember.guidFor(record);
      self.sendMessage('recordUpdated', {
        record: self.wrapRecord(record)
      });
    });
  },

  recordsRemoved: function(idx, count) {
    this.sendMessage('recordsRemoved', {
      index: idx,
      count: count
    });
  },

  wrapRecord: function(record) {
    var objectId = Ember.guidFor(record.object);
    this.sentRecords[objectId] = record;
    return {
      columnValues: record.columnValues,
      objectId: objectId
    };
  },

  releaseTypes: function() {
    if(this.releaseTypesMethod) {
      this.releaseTypesMethod();
      this.releaseTypesMethod = null;
      this.sentTypes = {};
    }
  },

  releaseRecords: function(type) {

  },

  reset: function() {
    this.releaseTypes();
  },

  messages: {
    getModelTypes: function() {
      var self = this;
      this.releaseTypes();
      this.releaseTypesMethod = this.adapter.getModelTypes(
        function(types) {
          self.modelTypesAdded(types);
        }, function(types) {
        self.modelTypesUpdated(types);
      });
    },

    releaseModelTypes: function() {
      this.releaseTypes();
    },

    getRecords: function(message) {
      var type = this.sentTypes[message.objectId], self = this;
      this.adapter.getRecords(type.object,
        function(recordsReceived) {
          self.recordsAdded(recordsReceived);
        },
        function(recordsUpdated) {
          self.recordsUpdated(recordsUpdated);
        },
        function() {
          self.recordsRemoved.apply(self, arguments);
        });
    },

    inspectModel: function(message) {
      this.get('objectInspector').sendObject(this.sentRecords[message.objectId].object);
    }
  }
});

export default DataDebug;
