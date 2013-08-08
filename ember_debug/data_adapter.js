var get = Ember.get, RSVP = Ember.RSVP, DS = window.DS;

var DataAdapter = Ember.Object.extend({
  init: function() {
    this._super();
  },

  application: null,

  countAttributes: 3,

  detect: function(klass) {
    return klass !== DS.Model && DS.Model.detect(klass);
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

  getModelTypes: function(typesAdded, typesUpdated) {
    var modelTypes = this.findModelTypes(),
        self = this, types, arrayObservers = [];
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
      arrayObservers.push({
        array: records,
        target: self,
        handle: observer
      });

      records.addArrayObserver(self, observer);

      return typeToSend;
    });

    typesAdded(types);

    var release = function() {
      arrayObservers.forEach(function(observer) {
        observer.array.removeArrayObserver(observer.target, observer.handle);
      });
    };

    function modelTypesDidChange(typeToSend, records) {
      return function() {
        typeToSend.count = get(records, 'length');
        typesUpdated([typeToSend]);
      };
    }

    return release;
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

  getRecords: function(type, recordsAdded, recordsUpdated, recordsRemoved) {
    var self = this;
    var observers = [];
    var records = this.findRecords(type);
    var recordsToSend = records.map(function(record) {
      var recordToSend = self.wrapRecord(type, record, recordsUpdated, observers);
      return recordToSend;
    });

    recordsAdded(recordsToSend);

    var contentDidChange = function(array, idx, removedCount, addedCount) {
      for (var i = idx; i < idx + addedCount; i++) {
        var record = array.objectAt(i);
        var r = self.wrapRecord(type, record, recordsUpdated, observers);
        recordsAdded([r]);
      }

      if (removedCount) {
        recordsRemoved(idx, removedCount);
      }
    };

    var observer = { didChange: contentDidChange, willChange: Ember.K };
    records.addArrayObserver(self, observer);

    var releaseMethod = function() {};

    return releaseMethod;
  },

  wrapRecord: function(type, record, recordsUpdated, observers) {
    var self = this;
    var recordToSend = { object: record };
    var columnValues = {};
    self.columnsForType(type).forEach(function(item) {
      columnValues[item.name] = get(record, item.name);
      var handler = function() {
        recordToSend.columnValues[item.name] = get(record, item.name);
        recordsUpdated([recordToSend]);
      };
      Ember.addObserver(record, item.name, handler);
      observers.push({
        obj: record,
        prop: item.name,
        handler: handler
      });
    });

    recordToSend.columnValues = columnValues;
    return recordToSend;
  },

  findRecords: function(type) {
    var store = this.get('application.__container__').lookup('store:main');
    return store.all(type);
  }

});

export default DataAdapter;
