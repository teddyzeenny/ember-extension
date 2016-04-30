import Ember from "ember";
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";
const { Controller, computed, isEmpty, run, on, observer, Handlebars: { SafeString }, inject: { controller } } = Ember;
const { gt, readOnly } = computed;
const { once } = run;

export default Controller.extend({
  renderTree: controller(),

  search: readOnly('renderTree.search'),

  isExpanded: false,

  expand() {
    this.set('isExpanded', true);
  },

  searchChanged: on('init', observer('search', function() {
    let search = this.get('search');
    if (!isEmpty(search)) {
      once(this, 'expand');
    }
  })),

  searchMatch: computed('search', 'name', function() {
    let search = this.get('search');
    if (isEmpty(search)) {
      return true;
    }
    let name = this.get('model.name');
    let regExp = new RegExp(escapeRegExp(search.toLowerCase()));
    return !!name.toLowerCase().match(regExp);
  }),

  nodeStyle: computed('searchMatch', function() {
    if (!this.get('searchMatch')) {
      return new SafeString('opacity: 0.5;');
    }
  }),

  level: computed('target.level', function() {
    let parentLevel = this.get('target.level');
    if (parentLevel === undefined) {
      parentLevel = -1;
    }
    return parentLevel + 1;
  }),

  nameStyle: computed('level', function() {
    return new SafeString(`padding-left: ${+this.get('level') * 20 + 5}px;`);
  }),

  hasChildren: gt('model.children.length', 0),

  expandedClass: computed('hasChildren', 'isExpanded', function() {
    if (!this.get('hasChildren')) { return; }

    if (this.get('isExpanded')) {
      return 'row_arrow_expanded';
    } else {
      return 'row_arrow_collapsed';
    }
  }),

  readableTime: computed('model.timestamp', function() {
    let d = new Date(this.get('model.timestamp'));
    let ms = d.getMilliseconds();
    let seconds = d.getSeconds();
    let minutes = d.getMinutes().toString().length === 1 ? '0' + d.getMinutes() : d.getMinutes();
    let hours = d.getHours().toString().length === 1 ? '0' + d.getHours() : d.getHours();

    return hours + ':' + minutes + ':' + seconds + ':' + ms;
  }),

  actions: {
    toggleExpand() {
      this.toggleProperty('isExpanded');
    }
  }

});
