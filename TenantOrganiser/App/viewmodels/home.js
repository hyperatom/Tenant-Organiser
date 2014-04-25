/**
 * View model for the Home view. 
 * Performs tasks associated with displaying an activity feed and communal message panel.
 * 
 * @module viewmodels/home
 */
define(['services/logger', 'services/datacontext', 'services/session', 'plugins/router'],

    function (logger, datacontext, session, router) {

        var houseName = ko.observable();

        var messageFeed = ko.observableArray();
        var activityFeed = ko.observableArray();

        var messageInput = ko.observable();

        var vm = {
            activate: activate,
            attached: viewAttached,
            title: 'Home',

            activityFeed: activityFeed,
            messageFeed: messageFeed,

            messageInput: messageInput,

            addMessage: addMessage,
            deleteMessage: deleteMessage,

            houseName: houseName
        };

        return vm;

        /** 
         * Activates the view model by initialising required data.
         * 
         * @name module:viewmodels/home#activate
         * @public
         * @function
         * @returns {Object} A promise returned when all asynchronous queries have completed. 
         */
        function activate() {
            houseName(session.sessionUser().House().HouseName);
            return Q.all([refreshAnnouncements(), refreshActivityLogs()]).then(function () {
                logger.log('Home View Activated', null, 'home', true);
            });
        }

        /** 
         * Called when a view is attached to this view model.
         * Attaches a keypress event listener to the message box.
         * 
         * @name module:viewmodels/home#viewAttached
         * @public
         * @function
         */
        function viewAttached() {
            $('#message-box').keypress(checkEnterKeyPressed);
        }

        /** 
         * Refreshes the announements associated with the session user's house.
         * 
         * @name module:viewmodels/home#refreshAnnouncements
         * @public
         * @function
         * @returns {Object} Promise returned when the announements are retrieved.
         */
        function refreshAnnouncements() {
            return datacontext.getAnnouncementsByHouse(messageFeed, session.sessionUser().HouseId());
        }

        /** 
         * Refreshes the activity logs associated with the session user's house.
         * 
         * @name module:viewmodels/home#refreshActivityLogs
         * @public
         * @function
         * @returns {Object} Promise returned when the activity logs are retrieved.
         */
        function refreshActivityLogs() {
            return datacontext.getActivitiyLogsByHouse(activityFeed, session.sessionUser().HouseId());
        }

        /** 
         * Deletes a specified communal message from the messages feed.
         * 
         * @name module:viewmodels/home#deleteMessage
         * @public
         * @function
         * @param {Object} message - Message to be deleted.
         * @returns {Object} Promise returned when the message has been deleted.
         */
        function deleteMessage(message) {
            var tmp = message;
            messageFeed.remove(message);
            tmp.entityAspect.setDeleted();
            return datacontext.saveChanges().then(refreshAnnouncements);
        }

        /** 
         * Adds the new communal message to the feed when the enter key is pressed.
         * 
         * @name module:viewmodels/home#checkEnterKeyPressed
         * @public
         * @function
         * @param {Object} event - Key press event.
         */
        function checkEnterKeyPressed(event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                addMessage();
            }
        }

        /** 
         * Creates a new communal message and adds it to the messges feed.
         * 
         * @name module:viewmodels/home#checkEnterKeyPressed
         * @public
         * @function
         * @param {Object} event - Key press event.
         * @returns {Object} Promise returned when the message has been added.
         */
        function addMessage() {

            if (!messageInput()) {
                logger.logError('Message cannot be empty.', null, 'home', true);
                return;
            }

            var messageEntity = datacontext.createAnnouncement();

            // Populate entity with observable values
            messageEntity.Content(messageInput());
            messageEntity.SentDate(moment().toString());
            messageEntity.User(session.sessionUser());
            messageEntity.House(session.sessionUser().House());

            // Ensure no other messages can be created
            $('#message-box').prop('disabled', true);

            return datacontext.saveChanges().then(function () {
                $('#message-box').prop('disabled', false);
                messageInput('');
            }).then(refreshAnnouncements);
        }
    });