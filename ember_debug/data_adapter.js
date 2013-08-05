var get = Ember.get;

var DataAdapter = Ember.Object.extend({
  application: null,

  findModelTypes: function() {
    var namespaces = Ember.Namespace.NAMESPACES;
    var ModelTypes = [];
    namespaces.forEach(function(namespace) {
      if (namespace === Ember || namespace === window.DS) {
        return true;
      }
      for (var key in namespace) {
        var ModelType = namespace[key];
        if (window.DS.Model.detect(ModelType)) {
          ModelTypes.push(ModelType);
        }
      }
    });
    return ModelTypes;
  },


  getCountRecords: function(ModelType) {
    var store = this.get('application.__container__').lookup('store:main');
    return store.all(ModelType).get('length');
  },



  findRecords: function(typeName) {
    var store = this.get('application.__container__').lookup('store:main');

    var recordArray = store.all(get(Ember.lookup, typeName));
    return recordArray.map(function(record) {
      var obj = {
        id: get(record, 'id')
      };
      record.eachAttribute(function(name) {
        obj[name] = get(record, name);
      });
      return obj;
    });
  },



  findRecord: function(typeName, id) {
    var store = this.get('application.__container__').lookup('store:main');
    return store.find(get(Ember.lookup, typeName), id);
  }


});

export default DataAdapter;
