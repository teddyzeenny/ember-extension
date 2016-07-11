import Ember from 'ember';

const { Component, computed, computed: { readOnly }, Handlebars: { SafeString } } = Ember;

/**
 * Base list view config
 *
 * @module Components
 * @extends Component
 * @class List
 * @namespace Components
 */
export default Component.extend({
  /**
   * @property classNames
   * @type {Array}
   */
  classNames: ["list-tree", "ember-list-view"],

  /**
   * Temporary way to pass the controller
   * is through the template.
   *
   * @property owner
   * @type {Controller}
   */
  owner: null,

  /**
   * @property contentHeight
   * @type {Integer}
   */
  contentHeight: readOnly('owner.application.contentHeight'),

  attributeBindings: ['style'],

  style: computed('height', function() {
    return new SafeString(`height:${this.get('height')}px`);
  }),

  /**
   * @property height
   * @type {Integer}
   */
  height: computed('contentHeight', function() {
    let headerHeight = 31;
    let contentHeight = this.get('contentHeight');

    // In testing list-view is created before `contentHeight` is set
    // which will trigger an exception
    if (!contentHeight) {
      return 1;
    }
    return contentHeight - headerHeight;
  })
});
