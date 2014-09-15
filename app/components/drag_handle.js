export default Ember.Component.extend({
  classNames: ['drag-handle'],
  classNameBindings: ['positionRight:drag-handle--right:drag-handle--left'],
  attributeBindings: ['style'],
  positionLeft: 0,
  positionRight: 0,
  minWidth: 60,

  startDragging: function() {
    var self = this,
        $body = Ember.$('body'),
        bodyWidth = $body.width(),
        $container = this.$().parent(),
        $containerOffsetLeft = $container.offset().left,
        $containerOffsetRight = $containerOffsetLeft + $container.width(),
        namespace = 'drag-' + this.get('elementId');

    this.sendAction('action', true);

    $body.on('mousemove.' + namespace, function(e){

      if (self.get('positionRight')) {
        var right = bodyWidth - e.pageX - (bodyWidth - $containerOffsetRight);
        if (right >= self.get('minWidth')) {
          self.set('positionRight', right);
        }
      }
      else if (self.get('positionLeft')) {
        var left = e.pageX - $containerOffsetLeft;
        if (left >= self.get('minWidth')) {
          self.set('positionLeft', left);
        }
      }
    })
    .on('mouseup.' + namespace + ' mouseleave.' + namespace, function(){
      self.stopDragging();
    });
  },

  stopDragging: function() {
    this.sendAction('action', false);
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
