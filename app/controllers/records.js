var RecordsController = Ember.ArrayController.extend({
  attributes: function() {
    var attributes = [], count = 0;
    this.get('modelType.attributes').forEach(function(item) {
      if (count > 3) { return false; }
      attributes.push(item);
      count++;
    });
    return attributes;
  }.property('modelType')
});

export default RecordsController;
