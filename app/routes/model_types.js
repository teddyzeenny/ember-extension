var Promise = Ember.RSVP.Promise;

var DataIndexRoute = Ember.Route.extend({
  model: function() {
    var self = this;
    return new Promise(function(resolve) {
      self.get('port').one('data:modelTypes', function(message) {
        resolve(message.modelTypes);
      });
      self.get('port').send('data:getModelTypes');
    });
  },

  events: {
    viewRecords: function(type) {
      this.transitionTo('records', type);
    }
  }
});

export default DataIndexRoute;
