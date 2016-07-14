import Ember from "ember";
const { Controller, computed, observer, run, inject: { controller }, getOwner } = Ember;
const { equal, bool, and, not, filter } = computed;
const { next, once } = run;

export default Controller.extend({
  application: controller(),

  queryParams: ['filter'],

  createdAfter: null,

  // below used to show the "refresh" message
  isEmpty: equal('model.length', 0),
  wasCleared: bool('createdAfter'),
  neverCleared: not('wasCleared'),
  shouldRefresh: and('isEmpty', 'neverCleared'),

  // Keep track of promise stack traces.
  // It is opt-in due to performance reasons.
  instrumentWithStack: false,

  init() {
    this._super(...arguments);
    // List-view does not support item controllers
    this.reopen({
      items: computed('filtered.[]', function() {
        return this.get('filtered').map(content => {
          return this.get('promiseItemController').create({ content });
        });
      })
    });
  },

  promiseItemController: computed(function() {
    return getOwner(this)._lookupFactory('controller:promise-item');
  }),

  /* jscs:disable validateIndentation */
  filtered: filter(
    'model.@each.{createdAt,fulfilledBranch,rejectedBranch,pendingBranch,isVisible}', function(item) {

      // exclude cleared promises
      if (this.get('createdAfter') && item.get('createdAt') < this.get('createdAfter')) {
        return false;
      }

      if (!item.get('isVisible')) {
        return false;
      }

      // Exclude non-filter complying promises
      // If at least one of their children passes the filter,
      // then they pass
      let include = true;
      if (this.get('filter') === 'pending') {
        include = item.get('pendingBranch');
      } else if (this.get('filter') === 'rejected') {
        include = item.get('rejectedBranch');
      } else if (this.get('filter') === 'fulfilled') {
        include = item.get('fulfilledBranch');
      }
      if (!include) {
        return false;
      }

      // Search filter
      // If they or at least one of their children
      // match the search, then include them
      let search = this.get('effectiveSearch');
      if (!Ember.isEmpty(search)) {
        return item.matches(search);
      }
      return true;

    }
  ),
  /* jscs:enable validateIndentation */


  filter: 'all',

  noFilter: equal('filter', 'all'),
  isRejectedFilter: equal('filter', 'rejected'),
  isPendingFilter: equal('filter', 'pending'),
  isFulfilledFilter: equal('filter', 'fulfilled'),

  search: null,
  effectiveSearch: null,

  searchChanged: observer('search', function() {
    Ember.run.debounce(this, this.notifyChange, 500);
  }),

  notifyChange() {
    this.set('effectiveSearch', this.get('search'));
    next(() => {
      this.notifyPropertyChange('model');
    });
  },

  actions: {
    setFilter(filter) {
      this.set('filter', filter);
      Ember.run.next(() => {
        this.notifyPropertyChange('filtered');
      });
    },
    clear() {
      this.set('createdAfter', new Date());
      once(this, this.notifyChange);
    },
    tracePromise(promise) {
      this.get('port').send('promise:tracePromise', { promiseId: promise.get('guid') });
    },
    updateInstrumentWithStack(bool) {
      this.port.send('promise:setInstrumentWithStack', { instrumentWithStack: bool });
    }
  }
});
