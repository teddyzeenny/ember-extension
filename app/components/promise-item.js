import Ember from "ember";
const { Component, computed, String: { htmlSafe }, getOwner } = Ember;
const { alias, notEmpty, empty, gt, equal } = computed;

const COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400'
};

export default Component.extend({
  tagName: '',

  promiseTreeController: computed(function() {
    return getOwner(this).lookup('controller:promiseTree');
  }),

  filter: alias('promiseTreeController.filter'),
  effectiveSearch: alias('promiseTreeController.effectiveSearch'),

  isError: equal('model.reason.type', 'type-error'),

  style: computed('model.state', function() {
    let color = '';
    if (this.get('model.isFulfilled')) {
      color = 'green';
    } else if (this.get('model.isRejected')) {
      color = 'red';
    } else {
      color = 'blue';
    }
    return htmlSafe(`background-color: ${COLOR_MAP[color]}; color: white;`);
  }),


  nodeStyle: computed('model.state', 'filter', 'effectiveSearch', function() {
    let relevant;
    switch (this.get('filter')) {
    case 'pending':
      relevant = this.get('model.isPending');
      break;
    case 'rejected':
      relevant = this.get('model.isRejected');
      break;
    case 'fulfilled':
      relevant = this.get('model.isFulfilled');
      break;
    default:
      relevant = true;
    }
    if (relevant && !Ember.isEmpty(this.get('effectiveSearch'))) {
      relevant = this.get('model').matchesExactly(this.get('effectiveSearch'));
    }
    if (!relevant) {
      return htmlSafe('opacity: 0.3;');
    } else {
      return htmlSafe('');
    }
  }),

  labelStyle: computed('model.level', function() {
    return htmlSafe(`padding-left: ${+this.get('model.level') * 20 + 5}px;`);
  }),

  expandedClass: computed('hasChildren', 'model.isExpanded', function() {
    if (!this.get('hasChildren')) { return; }

    if (this.get('model.isExpanded')) {
      return 'list__cell_arrow_expanded';
    } else {
      return 'list__cell_arrow_collapsed';
    }
  }),

  hasChildren: gt('model.children.length', 0),

  isTopNode: empty('model.parent'),

  settledValue: computed('model.value', function() {
    if (this.get('model.isFulfilled')) {
      return this.get('model.value');
    } else if (this.get('model.isRejected')) {
      return this.get('model.reason');
    } else {
      return '--';
    }
  }),

  isValueInspectable: notEmpty('settledValue.objectId'),

  hasValue: computed('settledValue', 'model.isSettled', function() {
    return this.get('model.isSettled') && this.get('settledValue.type') !== 'type-undefined';
  }),

  label: computed('model.label', function() {
    return this.get('model.label') || (!!this.get('model.parent') && 'Then') || '<Unknown Promise>';
  }),

  state: computed('model.state', function() {
    if (this.get('model.isFulfilled')) {
      return 'Fulfilled';
    } else if (this.get('model.isRejected')) {
      return 'Rejected';
    } else if (this.get('model.parent') && !this.get('model.parent.isSettled')) {
      return 'Waiting for parent';
    } else {
      return 'Pending';
    }

  }),

  timeToSettle: computed('model.createdAt', 'model.settledAt', 'model.parent.settledAt', function() {
    if (!this.get('model.createdAt') || !this.get('model.settledAt')) {
      return ' -- ';
    }
    let startedAt = this.get('model.parent.settledAt') || this.get('model.createdAt');
    let remaining = this.get('model.settledAt').getTime() - startedAt.getTime();
    return remaining;
  }),

  actions: {
    toggleExpand(...args) {
      this.sendAction('toggleExpand', ...args);
    },
    tracePromise(...args) {
      this.sendAction('tracePromise', ...args);
    },
    inspectObject(...args) {
      this.sendAction('inspectObject', ...args);
    },
    sendValueToConsole(...args) {
      this.sendAction('sendValueToConsole', ...args);
    }
  }
});
