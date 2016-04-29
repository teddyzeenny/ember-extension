import Ember from "ember";
const { computed, Controller } = Ember;
export default Controller.extend({
  needs: ['records'],

  checked: computed('controllers.records.filterValue', 'model.name', function() {
    return this.get('controllers.records.filterValue') === this.get('model.name');
  })
});
