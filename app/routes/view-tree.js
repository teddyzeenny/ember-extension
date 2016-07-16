import Ember from "ember";
import TabRoute from "ember-inspector/routes/tab";
const $ = Ember.$;

export default TabRoute.extend({
  model() {
    return [];
  },

  setupController() {
    this._super(...arguments);
    this.get('port').on('view:viewTree', this, this.setViewTree);
    this.get('port').on('view:stopInspecting', this, this.stopInspecting);
    this.get('port').on('view:startInspecting', this, this.startInspecting);
    this.get('port').send('view:getTree');
  },

  deactivate() {
    this.get('port').off('view:viewTree', this, this.setViewTree);
    this.get('port').off('view:stopInspecting', this, this.stopInspecting);
    this.get('port').off('view:startInspecting', this, this.startInspecting);
  },

  setViewTree(options) {
    let viewArray = topSort(options.tree);
    this.set('controller.model', viewArray);
  },

  startInspecting() {
    this.set('controller.inspectingViews', true);
  },

  stopInspecting() {
    this.set('controller.inspectingViews', false);
  },

  actions: {
    inspect(objectId) {
      if (objectId) {
        this.get('port').send('objectInspector:inspectById', { objectId: objectId });
      }
    },
    inspectElement(objectId) {
      this.get('port').send('view:inspectElement', { objectId: objectId });
    }
  }

});

function topSort(tree, list) {
  list = list || [];
  let view = $.extend({}, tree);
  view.parentCount = view.parentCount || 0;
  delete view.children;
  list.push(view);
  tree.children.forEach(child => {
    child.parentCount = view.parentCount + 1;
    topSort(child, list);
  });
  return list;
}
