import Ember from "ember";
const { Component, computed } = Ember;
const { notEmpty } = computed;

export default Component.extend({
  isExpanded: true,

  hasMap: notEmpty('model.hasSourceMap'),

  expandedClass: computed('hasMap', 'isExpanded', function() {
    if (this.get('isExpanded')) {
      return 'row_arrow_expanded';
    } else {
      return 'row_arrow_collapsed';
    }
  }),

  actions: {
    toggleExpand() {
      this.toggleProperty('isExpanded');
    }

  }
});
