import Ember from "ember";
import TabRoute from "ember-inspector/routes/tab";

const { RSVP: { Promise } } = Ember;

export default TabRoute.extend({
  model() {
    // block rendering until first batch arrives
    // Helps prevent flashing of "please refresh the page"
    return new Promise(resolve => {
      this.get('assembler').one('firstMessageReceived', () => {
        resolve(this.get('assembler.topSort'));
      });
      this.get('assembler').start();
    });
  },

  setupController() {
    this._super(...arguments);
    this.get('port').on('promise:instrumentWithStack', this, this.setInstrumentWithStack);
    this.get('port').send('promise:getInstrumentWithStack');
  },

  setInstrumentWithStack(message) {
    this.set('controller.instrumentWithStack', message.instrumentWithStack);
  },

  deactivate() {
    this.get('assembler').stop();
    this.get('port').off('promse:getInstrumentWithStack', this, this.setInstrumentWithStack);
  },

  actions: {
    sendValueToConsole(promise) {
      this.get('port').send('promise:sendValueToConsole', { promiseId: promise.get('guid') });
    },

    toggleExpand(promise) {
      let isExpanded = !promise.get('isExpanded');
      promise.set('isManuallyExpanded', isExpanded);
      promise.recalculateExpanded();
      let children = promise._allChildren();
      if (isExpanded) {
        children.forEach(child => {
          let isManuallyExpanded = child.get('isManuallyExpanded');
          if (isManuallyExpanded === undefined) {
            child.set('isManuallyExpanded', isExpanded);
            child.recalculateExpanded();
          }
        });
      }
    }
  }
});
