var Promise = Ember.RSVP.Promise;

var RecordsRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('modelType', this.modelFor('model_type'));
  },
  model: function() {
    var self = this, type = this.modelFor('model_type');
    return findRecords(type, this.get('port'));
  },

  events: {
    inspectModel: function(model) {
      this.get('port').send('data:inspectModel', { objectId: Ember.get(model, 'objectId') });
    }
  }
});

function findRecords(type, port) {
  return new Promise(function(resolve) {
    port.one('data:records', function(message) {
      resolve(message.records);
    });
    port.send('data:getRecords', { objectId: type.objectId });
  });
}

export default RecordsRoute;
