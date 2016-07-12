import Ember from "ember";
const { run: { schedule, debounce } } = Ember;
export default Ember.View.extend({
  classNames: ['app'],

  classNameBindings: [
    'inactive',
    'controller.isDragging'
  ],

  inactive: Ember.computed.not('controller.active'),

  attributeBindings: ['tabindex'],
  tabindex: 1,

  height: Ember.computed.alias('controller.height'),

  didInsertElement() {
    this._super();

    Ember.$(window).on('resize.application-view-' + this.get('elementId'), function() {
      debounce(this, 'updateHeight', 200);
    }.bind(this));
    schedule('afterRender', this, 'updateHeight');
  },

  updateHeight() {
    // could be destroyed but with debounce pending
    if (this.$()) {
      this.set('height', this.$().height());
    }
  },

  willDestroyElement() {
    Ember.$(window).off('.application-view-' + this.get('elementId'));
  },

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
