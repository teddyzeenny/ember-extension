var RecordsController = Ember.ArrayController.extend({
  columns: Ember.computed.alias('modelType.columns')
});

export default RecordsController;
