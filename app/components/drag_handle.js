export default Ember.Component.extend({
  classNames: ['drag-handle'],
  classNameBindings: ['positionRight:drag-handle--right:drag-handle--left'],
  attributeBindings: ['style'],
  isDragging: false,
  positionLeft: 0,
  positionRight: 0,

  startDragging: function() {
    var self = this,
        $body = Ember.$('body'),
        bodyWidth = $body.width(),
        $container = this.$().parent(),
        $containerOffsetLeft = $container.offset().left,
        $containerOffsetRight = $containerOffsetLeft + $container.width(),
        namespace = 'drag-' + this.get('elementId');

    this.set('isDragging', true);

    $body.on('mousemove.' + namespace, function(e){

      if (self.get('positionRight')) {
        self.set('positionRight', bodyWidth - e.pageX - (bodyWidth -
          $containerOffsetRight));
      }
      else if (self.get('positionLeft')) {
        self.set('positionLeft', e.pageX - $containerOffsetLeft);
      }
    })
    .on('mouseup.' + namespace + ' mouseleave.' + namespace, function(){
      self.stopDragging();
    });
  },

  stopDragging: function() {
    this.set('isDragging', false);
    Ember.$('body').off('.drag-' + this.get('elementId'));
  },

  willDestroyElement: function() {
    this._super();
    this.stopDragging();
  },

  mouseDown: function() {
    this.startDragging();
    return false;
  },

  style: function () {
    if (this.get('positionRight')) {
      return 'right:' + this.get('positionRight') + 'px';
    }
    else if (this.get('positionLeft')) {
      return 'left:' + this.get('positionLeft') + 'px';
    }
    else {
      return '';
    }
  }.property('positionRight', 'positionLeft')
});
