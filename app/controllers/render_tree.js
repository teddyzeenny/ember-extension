var filterBy = Ember.computed.filterBy;

export default Ember.ArrayController.extend({
  needs: ['application'],

  filtered: filterBy('model', 'shouldShow', true),

  items: function() {
    var ArrayController = this.container.lookupFactory('controller:array');
    var itemController = ArrayController.extend({
      itemController: 'render-item'
    }).create();
    itemController.set('model', this.get('filtered'));
    return itemController;
  }.property('filtered')
});
