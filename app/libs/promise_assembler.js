import Promise from "models/promise";

var PromiseAssembler = Ember.Object.extend({

  all: function() { return []; }.property(),

  promiseIndex: function() { return {}; }.property(),

  topSort: function() { return []; }.property(),

  addPromises: function(promises) {
    var self = this;
    promises.forEach (function(item) {
      var guid = item.guid;
      var promise = this.updateOrCreate(item);
    });
  },

  updatePromises: function(promises) {
    console.log(promises);
  },

  updateTopSort: function(promise) {
  },

  createPromise: function(props) {
    var promise = Promise.create(props),
        index = this.get('all.length');

    this.get('all').pushObject(promise);
    this.get('promiseIndex')[promise.get('guid')] = index;
    return promise;
  },

  updateOrCreate: function(props) {
    var guid = props.guid;
    var promise = this.findOrCreate(guid);
    promise.set(props);
    this.updateTopSort(promise);
  },

  find: function(guid) {
    if (guid) {
      var index = this.get('promiseIndex')[guid];
      if (index !== undefined) {
        return this.get('all').objectAt(index);
      }
    } else {
      return this.get('all');
    }
  },

  findOrCreate: function(guid) {
    return this.find(guid) || this.createPromise({
      guid: guid
    });
  }

});

export default PromiseAssembler;
