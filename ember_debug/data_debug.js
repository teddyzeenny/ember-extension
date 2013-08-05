import PortMixin from 'mixins/port_mixin';
import DataAdapter from "data_adapter";

var classify = Ember.String.classify, get = Ember.get;


var DataDebug = Ember.Object.extend(PortMixin, {
  init: function() {
    this._super();
    this.adapter = DataAdapter.create({ application: this.get('application') });
  },

  adapter: null,

  namespace: null,

  port: Ember.computed.alias('namespace.port'),
  application: Ember.computed.alias('namespace.application'),
  objectInspector: Ember.computed.alias('namespace.objectInspector'),

  portNamespace: 'data',


  // THIS WILL BE PULLED INTO AN ADAPTER ==============

  getModelTypes: function() {
    var modelTypes = this.adapter.findModelTypes(), self = this;
    return modelTypes.map(function(ModelType) {
      var attributes = [ { name: 'id' } ];
      get(ModelType, 'attributes').forEach(function(name, meta) {
        attributes.push({ name: name });
      });
      return {
        name: ModelType.toString(),
        count: self.adapter.getCountRecords(ModelType),
        attributes: attributes
      };
    });
  },


  //==================================================

  messages: {
    getModelTypes: function() {
      this.sendMessage('modelTypes', {
        modelTypes: this.getModelTypes()
      });
    },

    getRecords: function(message) {
      var records = this.adapter.findRecords(message.modelType);
      this.sendMessage('records', {
        records: records
      });
    },

    inspectModel: function(message) {
      var record = this.adapter.findRecord(message.modelType, message.id);
      this.get('objectInspector').sendObject(record);
    }
  }
});

export default DataDebug;
