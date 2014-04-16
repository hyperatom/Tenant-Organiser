define(['config', 'services/datacontext', 'plugins/router'], 
    function (config, datacontext, router) {

        var sessionUser = new ko.observable();

        var session = {
            sessionUser: sessionUser,
            refreshSession: refreshSession,
            login: login,
            facebookLogin: facebookLogin,
            logout: logout,
            register: register,
            changePassword: changePassword
        };

        return session;

        function login(username, password) {

            // Attempt login and refresh session user
            // Also refresh forgery token because it changes for authenticated users
            return datacontext.login(username, password).then(refreshSession);
        }

        function facebookLogin(token) {
            return datacontext.facebookLogin(token).then(refreshSession);
        }

        function register(firstName, lastName, email, password, errorPrinterCallback) {

            return datacontext.register(firstName, lastName, email, password).then(function (data) {

                if (data.errors)
                    // Call print errors callback
                    errorPrinterCallback(data);

            }).then(refreshSession);
        }

        function logout() {
            return datacontext.logout().then(refreshSession);
        }

        function changePassword(newPassword) {
            return datacontext.changePassword(newPassword);
        }

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

        function refreshSession() {
            return refreshAntiForgeryToken().then(function () {
                return datacontext.getLoggedInUser(sessionUser);
            });
        }
    });