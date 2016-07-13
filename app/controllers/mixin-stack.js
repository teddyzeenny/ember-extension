import Ember from "ember";
const { Controller, computed, inject: { controller } } = Ember;
const get = Ember.get;
export default Controller.extend({
  application: controller(),

  trail: computed('model.[]', function() {
    let nested = this.get('model').slice(1);
    if (nested.length === 0) { return ""; }
    return "." + nested.mapBy('property').join(".");
  }),

  isNested: computed('model.[]', function() {
    return this.get('model.length') > 1;
  }),

  actions: {
    popStack() {
      if (this.get('isNested')) {
        this.get('application').popMixinDetails();
      }
    },

    sendObjectToConsole(obj) {
      let objectId = get(obj, 'objectId');
      this.get('port').send('objectInspector:sendToConsole', {
        objectId
      });
    }
  }
});
