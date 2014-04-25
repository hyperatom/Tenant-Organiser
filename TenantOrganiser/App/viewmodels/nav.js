/**
 * View model for the Navigation side bar.
 * Performs tasks associated with application navigation.
 * 
 * @module viewmodels/nav
 */
define(['services/logger', 'plugins/router', 'services/session', 'services/fbhelper'],
    function (logger, router, session, fb) {

        var vm = {
            activate: activate,
            title: 'Navigation View',
            houseName: session.sessionUser().House().HouseName,
            messagesTag: '/#messages',
            tenantsTag: '/#tenants',
            settingsTag: '/#account-settings',

            homeTag: '/#home',
            billsTag: '/#bills',
            tasksTag: '/#tasks',
            wishListTag: '/#wish-list',

            logoutClicked: logoutClicked,

            sessionUser: session.sessionUser
        };

        return vm;

        /** 
        * Activates the view model by initialising required data.
        * 
        * @name module:viewmodels/nav#activate
        * @public
        * @function
        * @returns {boolean} True if the view model activates successfully, false otherwise.
        */
        function activate() {
            logger.log('Navigation View Activated', null, 'nav', true);
            return true;
        }

        /** 
        * Gets the first name of the session user.
        * 
        * @name module:viewmodels/nav#getUserFullName
        * @public
        * @function
        * @returns {string} First name of the session user.
        */
        function getUserFullName() {
            return session.sessionUser().FirstName() + " " + session.sessionUser().LastName();
        }

        /** 
        * Logs the session user out of the application.
        * 
        * @name module:viewmodels/nav#logoutClicked
        * @public
        * @function
        * @returns {Object} Promise returned when the session user is logged out.
        */
        function logoutClicked() {
            if (session.sessionUser().IsFacebookUser())
                fb.logout();

            return session.logout().then(function () { router.navigate('#login') });
        }
    });