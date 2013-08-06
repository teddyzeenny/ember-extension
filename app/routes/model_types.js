var Promise = Ember.RSVP.Promise;

var ModelTypesRoute = Ember.Route.extend({
  model: function() {
    var self = this;
    return new Promise(function(resolve) {
      self.get('port').one('data:modelTypes', function(message) {
        resolve(message.modelTypes);
      });
      self.get('port').on('data:modelTypeUpdated', self, self.updateModelType);
      self.get('port').send('data:getModelTypes');
    });
  },

  deactivate: function() {
    this.get('port').off('data:modelTypeUpdated', this, this.updateModelType);
  },

  updateModelType: function(message) {
    var currentType = this.get('currentModel').findProperty('objectId', message.modelType.objectId);
    Ember.set(currentType, 'count', message.modelType.count);
  },

  events: {
    viewRecords: function(type) {
      this.transitionTo('records', type);
    }
  }
});

export default ModelTypesRoute;
