var RecordController = Ember.ObjectController.extend({

  modelTypeAttributes: Ember.computed.alias('target.target.attributes'),

  attributes: function() {
    var self = this;
    return this.get('modelTypeAttributes').map(function(attr) {
      return { name: attr.name, value: self.get(attr.name) };
    });
  }.property('modelTypeAttributes.@each', 'model')
});

export default RecordController;
