import Ember from "ember";
const { computed, Component, inject: { controller } } = Ember;
export default Component.extend({
  filterValue: null,
  checked: computed('filterValue', 'model.name', function() {
    return this.get('filterValue') === this.get('model.name');
  })
});
