import Ember from 'ember';
import ListItemView from 'ember-inspector/views/list-item';

const { computed: { readOnly } } = Ember;

/**
 * @module Views
 * @extends Views.List
 * @class ViewList
 * @namespace Views
 */
export default ListItemView.extend({
  /**
   * @property templateName
   * @type {String}
   * @default 'view_item'
   */
  templateName: 'view-item',

  /**
   * @property node
   * @type {Ember.Controller}
   */
  node: readOnly('content'),

  /**
   * Needed for tests
   *
   * @property attributeBindings
   * @type {Array}
   * @default ['data-label:label']
   */
  attributeBindings: ['data-label:label'],

  /**
   * @property label
   * @type {String}
   * @default 'tree-node'
   */
  label: 'tree-node',

  /**
   * @method mouseEnter
   * @param {Object} e event object
   */
  mouseEnter(e) {
    this.get('controller').send('previewLayer', this.get('node'));
    e.stopPropagation();
  },

  /**
   * @method mouseLeave
   * @param {Object} e event object
   */
  mouseLeave(e) {
    this.get('controller').send('hidePreview', this.get('node'));
    e.stopPropagation();
  }
});
