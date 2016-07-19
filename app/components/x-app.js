import Ember from 'ember';
const { Component, computed: { not } } = Ember;
export default Component.extend({
  classNames: ['app'],

  classNameBindings: [
    'inactive',
    'isDragging'
  ],

  attributeBindings: ['tabindex'],
  tabindex: 1,

  isDragging: false,

  /**
   * Bound
   * to application controller.
   *
   * @property active
   * @type {Boolean}
   * @default false
   */
  active: false,

  inactive: not('active'),

  focusIn() {
    if (!this.get('controller.active')) {
      this.set('controller.active', true);
    }
  },

  focusOut() {
    if (this.get('controller.active')) {
      this.set('controller.active', false);
    }
  }
});
