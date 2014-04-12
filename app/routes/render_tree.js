import RenderProfile from "models/render_profile";
var Promise = Ember.RSVP.Promise;

export default Ember.Route.extend({
  model: function() {
    var route = this, port = this.get('port');
    return new Promise(function(resolve) {
      port.one('render:profilesAdded', function(message) {
        resolve(route.assemble(message.profiles));
      });
      port.send('render:watchProfiles');
    });
  },

  setupController: function(controller) {
    this._super.apply(this, arguments);
    var port = this.get('port');
    port.on('render:profilesUpdated', this, this.profilesUpdated);
    port.on('render:profilesAdded', this, this.profilesAdded);
  },

  deactivate: function() {
    var port = this.get('port');
    port.off('render:profilesUpdated', this, this.profilesUpdated);
    port.off('render:profilesAdded', this, this.profilesAdded);
    port.send('render:releaseProfiles');
  },

  profilesUpdated: function(message) {
    this.set('controller.model', this.assemble(message.profiles));
  },

  profilesAdded: function(message) {
    var model = this.get('controller.model');
    var profiles = this.assemble(message.profiles);

    model.pushObjects(profiles);
  },

  assemble: function(profiles, parent, profileArray) {
    var route = this;
    profileArray = profileArray || [];
    profiles.forEach(function(item) {
      var children = item.children;
      delete item.children;
      var profile = RenderProfile.create(item);
      profileArray.pushObject(profile);
      if (parent) {
        profile.set('parent', parent);
        parent.get('children').pushObject(profile);
      }
      route.assemble(children, profile, profileArray);
    });
    return profileArray;
  },

  actions: {
    clearProfiles: function() {
      this.get('port').send('render:clear');
    },

    toggleExpand: function(model) {
      var isExpanded = model.get('isExpanded');
      model.toggleProperty('isExpanded');
      // The below is just to cause the filterBy CP to re-filter :(
      model.get('children').setEach('shouldShow');
    }
  }

});
