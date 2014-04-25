/**
 * View model for the Join House view. 
 * Performs tasks associated with joining and creating houses.
 * 
 * @module viewmodels/join-house
 */
define(['services/logger', 'plugins/router', 'services/session', 'services/datacontext', 'services/fbhelper'],

    function (logger, router, session, datacontext, fb) {

        var pageHeader = new ko.observable();

        var joinHouseCode = new ko.observable();

        var createHouseName = new ko.observable();
        var createHouseCode = new ko.observable();

        var houseJoinRequest = new ko.observable();

        var vm = {
            activate: activate,
            title: 'Join House',

            pageHeader: pageHeader,

            joinHouseCode: joinHouseCode,

            createHouseName: createHouseName,
            createHouseCode: createHouseCode,

            joinExistingHouseClicked: joinExistingHouseClicked,
            createNewHouseClicked: createNewHouseClicked,
            cancelRequestClicked: cancelRequestClicked,
            logoutClicked: logoutClicked,

            houseJoinRequest: houseJoinRequest
        };

        return vm;

        /** 
         * Activates the view model by initialising required data.
         * 
         * @name module:viewmodels/join-house#activate
         * @public
         * @function
         * @returns {Object} A promise returned when the house join request has been retrieved.
         */
        function activate() {
            initPageHeader(pageHeader);
            logger.log('Join House View Activated', null, 'join-house', true);
            return refreshHouseJoinRequest();
        }

        /** 
         * Initialises the welcome page heading based on the user's first name.
         *
         * @name module:viewmodels/join-house#initPageHeader
         * @public
         * @function
         */
        function initPageHeader(pageHeaderObservable) {
            pageHeaderObservable("Welcome " + session.sessionUser().FirstName() + "!");
        }

        /** 
         * Refreshes the session user's house join request.
         *
         * @name module:viewmodels/join-house#refreshHouseJoinRequest
         * @public
         * @function
         * @returns {Object} A promise returned when the house join request has been retrieved.
         */
        function refreshHouseJoinRequest() {
            return datacontext.getUsersJoinRequest(session.sessionUser, houseJoinRequest);
        }

        /** 
         * Logs the session user out of the application.
         * Navigates the user back to the login view.
         * 
         * @name module:viewmodels/join-house#logoutClicked
         * @public
         * @function
         * @returns {Object} A promise returned when the user has been logged out.
         */
        function logoutClicked() {
            // Log user out of Facebook if they are a Facebook user
            if (session.sessionUser().IsFacebookUser())
                fb.logout()

            return session.logout().then(function () { router.navigate('#login') });
        }

        /** 
         * Creates a new house join request using associates observable values.
         * 
         * @name module:viewmodels/join-house#joinExistingHouseClicked
         * @public
         * @function
         * @returns {Object} A promise returned when the hosue join request has been created.
         */
        function joinExistingHouseClicked() {
            return datacontext.requestHouseJoin(session.sessionUser, joinHouseCode()).then(function () {
                return refreshHouseJoinRequest();
            });
        }

        /** 
         * Cancels the session user's existing house join request.
         * 
         * @name module:viewmodels/join-house#cancelRequestClicked
         * @public
         * @function
         * @param {Object} request - House join request to be cancelled.
         * @returns {Object} A promise returned when the house join request has been cancelled.
         */
        function cancelRequestClicked(request) {
            // Copy to temp variable
            var req = houseJoinRequest();
            houseJoinRequest(null);
            req.entityAspect.setDeleted();
            return datacontext.saveChanges().then(refreshHouseJoinRequest);
        }

        /** 
         * Creates a new house using associated observable values.
         * Navigates the user to the home view of the new house.
         *
         * @name module:viewmodels/join-house#createNewHouseClicked
         * @public
         * @function
         * @returns {Object} A promise returned when the house has been created.
         */
        function createNewHouseClicked() {
            return datacontext.createHouse(session.sessionUser, createHouseName(), createHouseCode()).then(session.refreshSession).then(function () {
                router.navigate('#home');
            });
        }
    });