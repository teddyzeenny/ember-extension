import Ember from 'ember';
import checkCurrentRoute from "ember-inspector/utils/check-current-route";
const { Component, computed, String: { htmlSafe } } = Ember;

export default Component.extend({
  // passed as an attribute to the component
  currentRoute: null,

  classNames: ['list__row'],
  classNameBindings: ['isCurrent:list__row_highlight'],
  attributeBindings: ['label:data-label'],

  label: 'route-node',

  labelStyle: computed('model.parentCount', function() {
    return htmlSafe(`padding-left: ${+this.get('model.parentCount') * 20 + 5}px;`);
  }),

  isCurrent: computed('currentRoute', 'model.value.name', function() {
    let currentRoute = this.get('currentRoute');
    if (!currentRoute) {
      return false;
    }

    return checkCurrentRoute( currentRoute, this.get('model.value.name') );
  }),

  actions: {
    inspectRoute(...args) {
      this.sendAction('inspectRoute', ...args);
    },
    sendRouteHandlerToConsole(...args) {
      this.sendAction('sendRouteHandlerToConsole', ...args);
    },
    inspectController(...args) {
      this.sendAction('inspectController', ...args);
    },
    sendControllerToConsole(...args) {
      this.sendAction('sendControllerToConsole', ...args);
    }
  }
});
