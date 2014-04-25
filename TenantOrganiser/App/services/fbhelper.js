/**
 * Module interfacing the facebook.js library exposing only the functionality required
 * for the Tenant Organiser to perform Facebook login and registration.
 *
 * @module services/fbhelper
 */
define(['facebook', 'plugins/router', 'services/session'],
    
    function (facebook, router, session) {

        var fbhelper = {
            init: init,
            logout: logout
        };

        return fbhelper;

        /** 
         * Initialises a connection to the Facebook API.
         * 
         * @name module:services/fbhelper#init
         * @public
         * @function
         */
        function init() {
            FB.init({
                appId: '533178160135622',
                status: true, // check login status
                cookie: true, // enable cookies to allow the server to access the session
                xfbml: true  // parse XFBML
            });

            FB.Event.subscribe('auth.authResponseChange', function (response) {
                if (response.status === 'connected') {
                    FB.getLoginStatus(function (response) {
                        var token = response.authResponse.accessToken;

                        if (token) {
                            session.facebookLogin(token).then(function () {
                                router.navigate('#home');
                            });
                        }
                    });
                } else if (response.status === 'not_authorized') {

                } else {

                }
            });
        }

        /** 
         * Logs the current user out of Facebook.
         * 
         * @name module:services/fbhelper#logout
         * @public
         * @function
         */
        function logout() {
            return FB.logout();
        }
    });