/**
 * A module used to manage the state of the current user session and make 
 * changes to the session user's details.
 * 
 * @module services/session
 */
define(['../config', 'services/datacontext', 'plugins/router'],

    function (config, datacontext, router) {

        var sessionUser = new ko.observable();

        var session = {
            sessionUser: sessionUser,
            refreshSession: refreshSession,
            login: login,
            facebookLogin: facebookLogin,
            logout: logout,
            register: register,
            changePassword: changePassword,
            changeEmail: changeEmail
        };

        return session;

        /** 
         * Creates a new session user with the server if the specified credentials are valid.
         * 
         * @name module:services/session#login
         * @public
         * @function
         * @param {string} email - Email address of the user attempting to log in.
         * @param {string} password - Password of the user attempting to log in.
         */
        function login(email, password) {

            // Attempt login and refresh session user
            // Also refresh forgery token because it changes for authenticated users
            return datacontext.login(email, password).then(function () {
                return refreshSession();
            });
        }

        /** 
         * Creates a new session user with the server if the specified Facebook token is valid.
         * 
         * @name module:services/session#facebookLogin
         * @public
         * @function
         * @param {string} token - Authentication token acquired from Facebook login process.
         */
        function facebookLogin(token) {
            return datacontext.facebookLogin(token).then(refreshSession);
        }

        /** 
         * Registers a new user account and creates a new session on the server.
         * 
         * @name module:services/session#register
         * @public
         * @function
         * @param {string} firstName - First name of the user to be registered.
         * @param {string} lastName - Last name of the user to be registered.
         * @param {string} email - Email address of the user to be registered.
         * @param {string} password - Password of the user to be registered.
         * @param {Function} errorPrinterCallback - Function to be called if errors occur.
         */
        function register(firstName, lastName, email, password, errorPrinterCallback) {
            return datacontext.register(firstName, lastName, email, password).then(function (data) {
                data.errors ? errorPrinterCallback(data) : null;
            }).then(refreshSession);
        }

        /** 
         * Logs the current session user out of the application.
         * 
         * @name module:services/session#logout
         * @public
         * @function
         * @returns {Object} Promise returned by refreshSession().
         */
        function logout() {
            return datacontext.logout().then(refreshSession);
        }

        /** 
         * Changes the password of the current session user.
         * 
         * @name module:services/session#changePassword
         * @public
         * @function
         * @param {string} newPassword - New password for the current session user.
         * @returns {Object} Promise returned by changePassword().
         */
        function changePassword(newPassword) {
            return datacontext.changePassword(newPassword);
        }

        /** 
         * Changes the email of the current session user.
         * 
         * @name module:services/session#changeEmail
         * @public
         * @function
         * @param {string} newEmail - New email for the current session user.
         * @returns {Object} Promise returned by changeEmail().
         */
        function changeEmail(newEmail) {
            return datacontext.changeEmail(newEmail);
        }

        /** 
         * Updates the applications anti-forgery token returned by the server.
         * 
         * @name module:services/session#refreshAntiForgeryToken
         * @public
         * @function
         * @returns {Object} Promise returned by ajax call.
         */
        function refreshAntiForgeryToken() {
            // Get the latest forgery token from server
            return $.ajax({
                type: "GET",
                url: "account/refreshtoken"
            }).then(function (data) {
                // Update the form's token value on the DOM
                $('#__AjaxAntiForgeryForm').html(data);
            });      
        }

        /** 
         * Gets the most up to date anti-forgery token from the server
         * and refreshes the currently logged in user, if any.
         * 
         * @name module:services/session#refreshAntiForgeryToken
         * @public
         * @function
         * @returns {Object} Promise returned by getLoggedInUser().
         */
        function refreshSession() {
            return refreshAntiForgeryToken().then(function () {
                return datacontext.getLoggedInUser(sessionUser);
            });
        }
    });