import Ember from "ember";
const { computed, Controller, inject: { controller } } = Ember;
export default Controller.extend({
  records: controller(),
  checked: computed('records.filterValue', 'model.name', function() {
    return this.get('records.filterValue') === this.get('model.name');
  })
});
