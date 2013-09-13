import PortMixin from "mixins/port_mixin";

var layerDiv,
    previewDiv,
    highlightedElement,
    previewedElement,
    $ = Ember.$;

var ViewDebug = Ember.Object.extend(PortMixin, {

  namespace: null,

  port: Ember.computed.alias('namespace.port'),

  objectInspector: Ember.computed.alias('namespace.objectInspector'),

  retainedObjects: [],

  init: function() {
    this._super();
    var self = this;

    this.viewListener();
    this.retainedObjects = [];

    layerDiv = $('<div>').appendTo('body').get(0);
    layerDiv.style.display = 'none';
    layerDiv.setAttribute('data-label', 'layer-div');

    previewDiv = $('<div>').appendTo('body').css('pointer-events', 'none').get(0);
    previewDiv.style.display = 'none';
    previewDiv.setAttribute('data-label', 'preview-div');

    $(window).on('resize.' + this.get('eventNamespace'), function() {
      if (highlightedElement) {
        self.highlightView(highlightedElement);
      }
    });
  },

  retainObject: function(object) {
    this.retainedObjects.push(object);
    return this.get('objectInspector').retainObject(object);
  },

  releaseCurrentObjects: function() {
    var self = this;
    this.retainedObjects.forEach(function(item) {
      self.get('objectInspector').releaseObject(Ember.guidFor(item));
    });
    this.retainedObjects = [];
  },

  eventNamespace: Ember.computed(function() {
    return 'view_debug_' + Ember.guidFor(this);
  }),

  willDestroy: function() {
    this._super();
    $(window).off(this.get('eventNamespace'));
    $(layerDiv).remove();
    $(previewDiv).remove();
    Ember.View.removeMutationListener(this.viewTreeChanged);
    this.releaseCurrentObjects();
    this.stopInspecting();
  },

  portNamespace: 'view',

  messages: {
    getTree: function() {
      this.sendTree();
    },
    hideLayer: function() {
      this.hideLayer();
    },
    showLayer: function(message) {
      this.showLayer(message.objectId);
    },
    previewLayer: function(message) {
      this.previewLayer(message.objectId);
    },
    hidePreview: function(message) {
      this.hidePreview(message.objectId);
    },
    inspectViews: function(message) {
      if (message.inspect) {
        this.startInspecting();
      } else {
        this.stopInspecting();
      }
    }
  },

  sendTree: function() {
    Ember.run.scheduleOnce('afterRender', this, this.scheduledSendTree);
  },

  startInspecting: function() {
    var self = this, viewElem = null;
    this.sendMessage('startInspecting', {});

    // we don't want the preview div to intercept the mousemove event
    $(previewDiv).css('pointer-events', 'none');

    $('body').on('mousemove.inspect-' + this.get('eventNamespace'), function(e) {
      var originalTarget = $(e.originalEvent.target), oldViewElem = viewElem;
      viewElem = self.findNearestView(originalTarget);
      if (viewElem) {
        self.highlightView(viewElem, true);
      }
    })
    .on('mousedown.inspect-' + this.get('eventNamespace'), function() {
      // prevent app-defined clicks from being fired
      $(previewDiv).css('pointer-events', '')
      .one('mouseup', function() {
        if (viewElem) {
          self.highlightView(viewElem);
        }
        self.stopInspecting();
        return false;
      });
    })
    .css('cursor', '-webkit-zoom-in');
  },

  findNearestView: function(elem) {
    var viewElem;
    if (!elem || elem.length === 0) { return null; }
    if (elem.hasClass('ember-view')) {
      viewElem = elem.get(0);
      if (this.get('objectInspector').sentObjects[viewElem.id]) {
        return viewElem;
      }
    }
    return this.findNearestView($(elem).parents('.ember-view:first'));
  },

  stopInspecting: function() {
    $('body')
    .off('mousemove.inspect-' + this.get('eventNamespace'))
    .off('mousedown.inspect-' + this.get('eventNamespace'))
    .off('click.inspect-' + this.get('eventNamespace'))
    .css('cursor', '');

    this.sendMessage('stopInspecting', {});
  },

  scheduledSendTree: function() {
    var self = this;
    // Use next run loop because
    // some initial page loads
    // don't trigger mutation listeners
    // TODO: Look into that in Ember core
    Ember.run.next(function() {
      self.releaseCurrentObjects();
      var tree = self.viewTree();
      if (tree) {
        self.sendMessage('viewTree', {
          tree: tree
        });
      }
    });
  },

  viewListener: function() {
    var self = this;

    this.viewTreeChanged = function() {
      self.sendTree();
      self.hideLayer();
    };

    Ember.View.addMutationListener(this.viewTreeChanged);
  },

  viewTree: function() {
     var rootView = Ember.View.views[$('.ember-application > .ember-view').attr('id')];
      // In case of App.reset view is destroyed
      if (!rootView) {
        return false;
      }
      var retained = [];

      var children = [];
      var treeId = this.retainObject(retained);

      var tree = { value: this.inspectView(rootView, retained), children: children, treeId: treeId };

      this.appendChildren(rootView, children, retained);


      return tree;
  },

  inspectView: function(view, retained) {
    var templateName = view.get('templateName') || view.get('_debugTemplateName'),
        viewClass = view.constructor.toString(), match, name;

    if (viewClass.match(/\._/)) {
      viewClass = "virtual";
    } else if (match = viewClass.match(/\(subclass of (.*)\)/)) {
      viewClass = match[1];
    }

    var tagName = view.get('tagName');
    if (tagName === '') {
      tagName = '(virtual)';
    }

    tagName = tagName || 'div';

    var controller = view.get('controller');

    if (templateName) {
      name = templateName;
    } else {
          var key = controller.get('_debugContainerKey'),
          className = controller.constructor.toString();

      if (key) {
        name = key.split(':')[1];
      } else {
        if (className.charAt(0) === '(') {
          className = className.match(/^\(subclass of (.*)\)/)[1];
        }
        name = className.split('.')[1];
        name = name.charAt(0).toLowerCase() + name.substr(1);
      }
    }

    var viewId = this.retainObject(view);
    retained.push(viewId);

    var value = {
      viewClass: viewClass,
      objectId: viewId,
      name: name,
      template: templateName || '(inline)',
      tagName: tagName,
      controller: {
        name: controllerName(controller),
        objectId: this.retainObject(controller)
      }
    };
    var model = controller.get('model');
    if (model) {
      value.model = {
        name: modelName(model),
        objectId: this.retainObject(model)
      };
    }

    return value;
  },

  appendChildren: function(view, children, retained) {
    var self = this;
    var childViews = view.get('_childViews'),
        controller = view.get('controller');

    childViews.forEach(function(childView) {
      if (!(childView instanceof Ember.Object)) { return; }

      if (childView.get('controller') !== controller) {
        var grandChildren = [];
        children.push({ value: self.inspectView(childView, retained), children: grandChildren });
        self.appendChildren(childView, grandChildren, retained);
      } else {
        self.appendChildren(childView, children, retained);
      }
    });
  },

  highlightView: function(element, preview) {
    var self = this;
    var range, view, rect, div;
    if (!element) { return; }

    if (preview) {
      previewedElement = element;
      div = previewDiv;
    } else {
      highlightedElement = element;
      div = layerDiv;
      this.hidePreview();
    }

    if (element instanceof Ember.View && element.get('isVirtual')) {
      view = element;
      if (view.get('isVirtual')) {
        range = virtualRange(view);
        rect = range.getBoundingClientRect();
      }
    } else if (element instanceof Ember.View) {
      view = element;
      rect = view.get('element').getBoundingClientRect();
    } else {
      view = Ember.View.views[element.id];
      rect = element.getBoundingClientRect();
    }

    // take into account the scrolling position as mentioned in docs
    // https://developer.mozilla.org/en-US/docs/Web/API/element.getBoundingClientRect
    rect = $().extend({}, rect);
    rect.top = rect.top + window.scrollY;
    rect.left = rect.left + window.scrollX;

    var templateName = view.get('templateName') || view.get('_debugTemplateName'),
        controller = view.get('controller'),
        model = controller && controller.get('model');

    $(div).css(rect);
    $(div).css({
      display: "block",
      position: "absolute",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      border: "2px solid rgb(102, 102, 102)",
      padding: "0",
      boxSizing: "border-box",
      color: "rgb(51, 51, 255)",
      fontFamily: "Menlo, sans-serif",
      minHeight: 63,
      zIndex: 10000
    });

    var output = "";

    if (!preview) {
      output = "<span class='close' data-label='layer-close'>&times;</span>";
    }

    if (templateName) {
      output += "<p class='template'><span>template</span>=<span data-label='layer-template'>" + escapeHTML(templateName) + "</span></p>";
    }

    output += "<p class='controller'><span>controller</span>=<span data-label='layer-controller'>" + escapeHTML(controllerName(controller)) + "</span></p>";

    if (model) {
      output += "<p class='model'><span>model</span>=<span data-label='layer-model'>" + escapeHTML(model.toString()) + "</span></p>";
    }

    $(div).html(output);

    $('p', div).css({ float: 'left', margin: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '5px', color: 'rgb(0, 0, 153)' });
    $('p.model', div).css({ clear: 'left' });
    $('p span:first-child', div).css({ color: 'rgb(153, 153, 0)' });
    $('p span:last-child', div).css({ color: 'rgb(153, 0, 153)' });

    if (!preview) {
      $('span.close', div).css({
        float: 'right',
        margin: '5px',
        background: '#666',
        color: '#eee',
        fontFamily: 'helvetica, sans-serif',
        fontSize: '12px',
        width: 16,
        height: 16,
        lineHeight: '14px',
        borderRadius: 16,
        textAlign: 'center',
        cursor: 'pointer'
      }).on('click', function() {
        self.hideLayer();
      });
    }

    $('p.controller span:last-child', div).css({ cursor: 'pointer' }).click(function() {
      self.get('objectInspector').sendObject(controller);
    });

    $('p.model span:last-child', div).css({ cursor: 'pointer' }).click(function() {
      self.get('objectInspector').sendObject(controller.get('model'));
    });
  },

  showLayer: function(objectId) {
    this.highlightView(this.get('objectInspector').sentObjects[objectId]);
  },

  previewLayer: function(objectId) {
    this.highlightView(this.get('objectInspector').sentObjects[objectId], true);
  },

  hideLayer: function() {
    layerDiv.style.display = 'none';
    highlightedElement = null;
  },

  hidePreview: function() {
    previewDiv.style.display = 'none';
    previewedElement = null;
  }
});


function modelName(model) {
  var name = '<Unkown model>';
  if (model.toString) {
    name = model.toString();
  }
  if (name.length > 50) {
    name = name.substr(0, 50) + '...';
  }
  return name;
}

function controllerName(controller) {
  var key = controller.get('_debugContainerKey'),
      className = controller.constructor.toString(),
      name;

  if (key) {
    name = key.split(':')[1];
  } else {
    if (className.charAt(0) === '(') {
      className = className.match(/^\(subclass of (.*)\)/)[1];
    }
    name = className.split('.')[1];
    name = name.charAt(0).toLowerCase() + name.substr(1);
  }
  return name;
}

function escapeHTML(string) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(string));
  return div.innerHTML;
}

function virtualRange(view) {
  var morph = view.get('morph'),
      startId = morph.start,
      endId = morph.end;

  var range = document.createRange();
  range.setStartAfter($('#' + startId)[0]);
  range.setEndBefore($('#' + endId)[0]);

  return range;
}


export default ViewDebug;
