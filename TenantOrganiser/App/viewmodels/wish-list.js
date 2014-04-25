/**
 * View model for the Wish List view.
 * Performs tasks associated with managing wish list items.
 * 
 * @module viewmodels/wish-list
 */
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

        /** 
        * Activates the view model by initialising required data.
        * 
        * @name module:viewmodels/wish-list#activate
        * @public
        * @function
        * @returns {Object} Promise returned when the wish list items have been retrieved.
        */
        function activate() {
            return refreshWishListItems().then(function () {
                logger.log('Wish List View Activated', null, 'wish-list', true);
            });
        }

        /** 
        * Called when a view is attached to this view model.
        * Initialises a keypress listener on the message box.
        * 
        * @name module:viewmodels/wish-list#viewAttached
        * @public
        * @function
        */
        function viewAttached() {
            $('#message-box').keypress(checkEnterKeyPressed);
        }

        /** 
        * Refreshes the list of wish list items associate with the session user's house.
        * 
        * @name module:viewmodels/wish-list#refreshWishListItems
        * @public
        * @function
        * @returns {Object} Promise returned when the wish list items have been retrieved.
        */
        function refreshWishListItems() {
            return datacontext.getWishListItemsByHouse(wishListItems, session.sessionUser().House().Id());
        }

        /** 
        * Adds the wish list item to the list if the enter key was pressed.
        * 
        * @name module:viewmodels/wish-list#checkEnterKeyPressed
        * @public
        * @function
        * @param {Object} event - Keypress event.
        */
        function checkEnterKeyPressed(event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                wishListItemAdded();
            }
        }

        /** 
        * Inverts the purchased status of a specified wish list item.
        * Sets the user who acquired the item to the current session user.
        * Sets the date that the item was acquired to the current date.
        * 
        * @name module:viewmodels/wish-list#wishListItemPurchasedClicked
        * @public
        * @function
        * @param {Object} event - Keypress event.
        */
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

        /** 
        * Creates a new wish list item with assocated observable values. 
        * 
        * @name module:viewmodels/wish-list#wishListItemAdded
        * @public
        * @function
        * @returns {Object} Promise returned when the new wish list item has been saved.
        */
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

        /** 
        * Deletes the specified wish list item and removes it from the observable array.
        * 
        * @name module:viewmodels/wish-list#wishListItemRemoved
        * @public
        * @function
        * @param {Object} item - Wish List item to be deleted.
        * @returns {Object} Promise returned when the wish list item has been deleted.
        */
        function wishListItemRemoved(item) {
            wishListItems.remove(item);
            item.entityAspect.setDeleted();
            return datacontext.saveChanges().then(refreshWishListItems);
        }
    });