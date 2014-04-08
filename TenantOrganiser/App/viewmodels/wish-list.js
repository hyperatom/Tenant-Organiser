define(['services/logger', 'services/datacontext', 'services/session'],
    function (logger, datacontext, session) {

    var wishListItems = new ko.observableArray();

    var newItemName = new ko.observable();

    var vm = {
        activate: activate,
        title: 'Wish List',
        attached: viewAttached,

        wishListItems: wishListItems,

        newItemName: newItemName,

        wishListItemAdded: wishListItemAdded,
        wishListItemRemoved: wishListItemRemoved,

        wishListItemPurchasedClicked: wishListItemPurchasedClicked
    };

    return vm;


    function activate() {
        return refreshWishListItems().then(function () {
            logger.log('Wish List View Activated', null, 'wish-list', true);
        });
    }

    function viewAttached() {

        $('#message-box').keypress(checkEnterKeyPressed);
    }

    function refreshWishListItems() {
        return datacontext.getWishListItems(wishListItems, session.sessionUser().House().Id());
    }

    function checkEnterKeyPressed(event) {

        var keycode = (event.keyCode ? event.keyCode : event.which);

        if (keycode == '13') {
            wishListItemAdded();
        }
    }

    function wishListItemPurchasedClicked(item) {

        if (item.UserAcquired()) {

            item.UserAcquiredId(null);
            item.AquiredOn(null);

            logger.logSuccess('Item ' + item.ItemName() + ' Un-Purchased!', null, 'wish-list', true);
        } else {

            item.UserAcquiredId(session.sessionUser().Id());
            item.AquiredOn(moment().utc().toString());

            logger.logSuccess('Item ' + item.ItemName() + ' Purchased!', null, 'wish-list', true);
        }

        return datacontext.saveChanges().then(refreshWishListItems);
    }

    function wishListItemAdded() {

        if (!newItemName()) {
            logger.logError('Item name must not be empty.', null, 'wish-list', true);
            return;
        }

        var item = datacontext.createWishListItem();

        item.ItemName(newItemName());
        item.UserAddedId(session.sessionUser().Id());
        item.HouseId(session.sessionUser().House().Id());

        return datacontext.saveChanges().then(function () {
            logger.logSuccess('Item ' + newItemName() + ' Added!', null, 'wish-list', true);
            newItemName('');
        }).then(refreshWishListItems);
    }

    function wishListItemRemoved(item) {
        wishListItems.remove(item);
        item.entityAspect.setDeleted();
        return datacontext.saveChanges().then(refreshWishListItems);
    }
});