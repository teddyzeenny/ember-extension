/* The header columns are not inside the scrollable list.  The scrollbar will
 * cause flexbox to fail to match header and content.
 * This is a hack to allow account for scrollbar width (if any)
 */
import Ember from "ember";
const { on, run: { next } } = Ember;

function accountForScrollbar() {
  // let outside = this.$('.list').innerWidth();
  // let inside = this.$('.list__content')[0].clientWidth;
  // this.$('.list__cell_spacer').css('width', `${outside - inside}px`);
}

export default Ember.Mixin.create({
  _accountForScrollbar: on('didInsertElement', function() {
    next(this, accountForScrollbar);
  })
});
