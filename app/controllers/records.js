var RecordsController = Ember.ArrayController.extend({
  columns: Ember.computed.alias('modelType.columns'),

  search: '',

  modelChanged: function() {
    this.set('search', '');
  }.observes('model'),

  recordToString: function(record) {
    var columnValues = Ember.get(record, 'columnValues');
    var search = '';
    for(var i in columnValues) {
      search += ' ' + columnValues[i];
    }
    return search.toLowerCase();
  },

  filtered: function() {
    var self = this, search = this.get('search');
    if (Ember.isEmpty(search)) {
      return this.get('model');
    }
    return this.get('model').filter(function(item) {
      var searchString = self.recordToString(item);
      return !!searchString.toLowerCase().match(new RegExp('.*' + search + '.*'));
    });
  }.property('search', 'model.columnValues')


});

export default RecordsController;
