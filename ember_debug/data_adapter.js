var get = Ember.get, RSVP = Ember.RSVP;

var DataAdapter = Ember.Object.extend({
  init: function() {
    this._super();
    this.ModelClass = window.DS.Model;
  },

  application: null,

  countAttributes: 3,
  ModelClass: null,

  detect: function(klass) {
    return klass !== this.ModelClass && this.ModelClass.detect(klass);
  },

  releaseModelTypes: function(target) {
    var modelTypes = this.findModelTypes(), self = this;

    modelTypes.forEach(function(type) {
      var objectId = Ember.guidFor(type);
      var records = self.findRecords(type);
    });
  },

  columnsForType: function(type) {
    var columns = [{ name: 'id' }], count = 0, self = this;
    get(type, 'attributes').forEach(function(name, meta) {
        if (count > self.countAttributes) { return false; }
        columns.push({ name: name });
        count++;
    });
    return columns;
  },

  getModelTypes: function(target, typesReceived, typeUpdated) {
    var modelTypes = this.findModelTypes(), self = this, types;
    types = modelTypes.map(function(type) {

      var columns = self.columnsForType(type);

      var records = self.findRecords(type);

      var typeToSend = {
        name: type.toString(),
        count: get(records, 'length'),
        columns: columns,
        object: type
      };

      var callback = modelTypesDidChange(typeToSend, records);
      var contentDidChange = function() { Ember.run.scheduleOnce('actions', this, callback); };

      var observer = { didChange: contentDidChange, willChange: Ember.K };
      typeToSend.release = function() { records.removeArrayObserver(self, observer); };

      records.addArrayObserver(self, observer);

      return typeToSend;
    });

    typesReceived.call(target, types);

    function modelTypesDidChange(typeToSend, records) {
      return function() {
        typeToSend.count = get(records, 'length');
        typeUpdated.call(target, typeToSend);
      };
    }
  },

  findModelTypes: function() {
    var namespaces = Ember.Namespace.NAMESPACES, types = [], self = this;

    namespaces.forEach(function(namespace) {

      if (namespace === Ember) { return true; }

      for (var key in namespace) {
        if (!namespace.hasOwnProperty(key)) { continue; }
        var klass = namespace[key];
        if (self.detect(klass)) {
          types.push(klass);
        }
      }
    });
    return types;
  },

  getCountRecords: function(type) {
    var store = this.get('application.__container__').lookup('store:main');
    return store.all(type).get('length');
  },

  getRecords: function(type, recordsReceived, recordAdded, recordUpdated, recordRemoved) {
    var self = this;
    var records = this.findRecords(type);
    var recordsToSend = records.map(function(record) {
      var count = 0;
      var columnValues = {};
      self.columnsForType(type).forEach(function(item) {
        columnValues[item.name] = get(record, item.name);
      });
      return {
        object: record,
        columnValues: columnValues
      };
    });

    var releaseMethod = function() {};

    return {
      records: RSVP.resolve(recordsToSend),
      release: releaseMethod
    };
  },

  findRecords: function(type) {
    var store = this.get('application.__container__').lookup('store:main');
    return store.all(type);
  }

});

export default DataAdapter;
