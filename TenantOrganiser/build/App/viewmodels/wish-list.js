define(["services/logger","services/datacontext","services/session"],function(e,n,t){function r(){return a().then(function(){e.log("Wish List View Activated",null,"wish-list",!0)})}function o(){$("#message-box").keypress(i)}function a(){return n.getWishListItems(u,t.sessionUser().House().Id())}function i(e){var n=e.keyCode?e.keyCode:e.which;"13"==n&&l()}function s(r){return r.UserAcquired()?(r.UserAcquiredId(null),r.AquiredOn(null),e.logSuccess("Item "+r.ItemName()+" Un-Purchased!",null,"wish-list",!0)):(r.UserAcquiredId(t.sessionUser().Id()),r.AquiredOn(moment().utc().toString()),e.logSuccess("Item "+r.ItemName()+" Purchased!",null,"wish-list",!0)),n.saveChanges().then(a)}function l(){if(!d())return e.logError("Item name must not be empty.",null,"wish-list",!0),void 0;var r=n.createWishListItem();return r.ItemName(d()),r.UserAddedId(t.sessionUser().Id()),r.HouseId(t.sessionUser().House().Id()),n.saveChanges().then(function(){e.logSuccess("Item "+d()+" Added!",null,"wish-list",!0),d("")}).then(a)}function c(e){return u.remove(e),e.entityAspect.setDeleted(),n.saveChanges().then(a)}var u=new ko.observableArray,d=new ko.observable,v={activate:r,title:"Wish List",attached:o,wishListItems:u,newItemName:d,wishListItemAdded:l,wishListItemRemoved:c,wishListItemPurchasedClicked:s};return v});