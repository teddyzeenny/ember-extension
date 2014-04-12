var EmberObject = Ember.Object;

export default EmberObject.extend({

  isExpanded: false,

  level: function() {
    if (!this.get('parent')) {
      return 0;
    } else {
      return this.get('parent.level') + 1;
    }
  }.property('parent', 'parent.level'),

  shouldShow: function(key, val) {
    if (!this.get('parent')) {
      return true;
    }
    return this.get('parent.isExpanded') && this.get('parent.shouldShow');
  }.property('parent', 'parent.isExpanded', 'parent.shouldShow'),

  parent: null,

  children: function() { return []; }.property()
});
