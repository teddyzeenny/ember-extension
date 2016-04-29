import Ember from "ember";
const { computed, Controller } = Ember;
const { readOnly } = computed;

export default Controller.extend({
  needs: ['mixin-details'],

  mixinDetails: readOnly('controllers.mixin-details'),
  objectId: readOnly('mixinDetails.model.objectId'),

  isExpanded: computed('model.expand', 'model.properties.length', function() {
    return this.get('model.expand') && this.get('model.properties.length') > 0;
  }),

  actions: {
    calculate({ name }) {
      let objectId = this.get('objectId');
      let mixinIndex = this.get('mixinDetails.model.mixins').indexOf(this.get('model'));

      this.get('port').send('objectInspector:calculate', {
        objectId,
        mixinIndex,
        property: name
      });
    },

    sendToConsole({ name }) {
      let objectId = this.get('objectId');

      this.get('port').send('objectInspector:sendToConsole', {
        objectId,
        property: name
      });
    },

    toggleExpanded() {
      this.toggleProperty('isExpanded');
    },

    digDeeper({ name }) {
      let objectId = this.get('objectId');

      this.get('port').send('objectInspector:digDeeper', {
        objectId,
        property: name
      });
    },

    saveProperty(property, value, dataType) {
      let mixinIndex = this.get('mixinDetails.model.mixins').indexOf(this.get('model'));

      this.get('port').send('objectInspector:saveProperty', {
        objectId: this.get('objectId'),
        property,
        value,
        mixinIndex,
        dataType
      });
    }
  }
});
