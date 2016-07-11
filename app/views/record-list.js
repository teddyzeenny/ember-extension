import ListView from 'ember-inspector/views/list';
import ListItemView from 'ember-inspector/views/list-item';

/**
 * @module Views
 * @extends Views.List
 * @class RecordList
 * @namespace Views
 */
export default ListView.extend({
  /**
   * @property itemViewClass
   * @type {Ember.View}
   */
  itemViewClass: ListItemView.extend({
    /**
     * @property templateName
     * @type {String}
     * @default 'record-item'
     */
    templateName: 'record-item'
  })
});
