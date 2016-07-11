import Ember from "ember";
const { View, computed, Handlebars: { SafeString } } = Ember;
const { readOnly } = computed;

export default View.extend({
  attributeBindings: ['style'],

  classNames: ["list-tree", "list-tree_scrollable"],

  style: computed('height', function() {
    return new SafeString(`height: ${this.get('height')}px;`);
  }),

  contentHeight: readOnly('controller.application.contentHeight'),

  filterHeight: 22,

  height: computed('contentHeight', function() {
    let filterHeight = this.get('filterHeight');
    let headerHeight = 30;
    let contentHeight = this.get('contentHeight');

    // In testing list-view is created before `contentHeight` is set
    // which will trigger an exception
    if (!contentHeight) {
      return 1;
    }
    return contentHeight - filterHeight - headerHeight;
  })
});
