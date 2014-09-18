// DraggableColumn
// ===============
// A wrapper for a resizable-column and a drag-handle component

export default Ember.View.extend({
  layoutName: 'draggableColumn',
  tagName: '', // Prevent wrapping in a div
  side: 'left'
});