define(['services/logger', 'plugins/router', 'services/session', 'services/fbhelper'],
    function (logger, router, session, fb) {

        var loginEmail = new ko.observable();
        var loginPassword = new ko.observable();

        var registerFullName = new ko.observable();
        var registerEmail = new ko.observable();
        var registerPassword1 = new ko.observable();
        var registerPassword2 = new ko.observable();

        var vm = {
            activate: activate,
            deactivate: deactivate,
            title: 'Login',
            attached: viewAttached,

            loginEmail: loginEmail,
            loginPassword: loginPassword,

            fbLoginClicked: fbLoginClicked,

            loginClicked: loginClicked,
            registerClicked: registerClicked,

            registerFullName: registerFullName,
            registerEmail: registerEmail,
            registerPassword1: registerPassword1,
            registerPassword2: registerPassword2,
        };

        return vm;

        function activate() {

            logger.log('Login View Activated', null, 'login', true);

            return true;
        }

        function deactivate() {
            loginEmail('');
            loginPassword('');
        }

        function viewAttached() {
            fb.init();
        }

        function fbLoginClicked() {

        }


        function loginClicked() {
            var hash = CryptoJS.SHA256(loginPassword()).toString();

            session.login(loginEmail, hash).then(function (data) {

                // If no data returned just return
                if (!data) {
                    logger.logError('Incorrect username or password!', null, 'login', true);
                    return;
                }

                // If user is assigned to a house navigate home
                if (data.House) {
                    router.navigate('#home');
                } else {
                    router.navigate('#join-house');
                }
            });
        }

        function registerClicked() {

            var fullNameArray = registerFullName().split(' ');

            // If passwords don't match, just return
            if (registerPassword1() !== registerPassword2()) {
                logger.logError('Both passwords must match!', null, 'login', true);
                return;
            }

            // Check empty full name
            if (!registerFullName()) {
                logger.logError('Full name cannot be empty.', null, 'login', true);
                return;
            }

            // Check full name is two or more names
            if (fullNameArray.length < 2) {
                logger.logError('Please enter a full name with two or more parts.', null, 'login', true);
                return;
            }

            // Check empty full name
            if (!registerFullName()) {
                logger.logError('Full name cannot be empty.', null, 'login', true);
                return;
            }

            // Check empty email
            if (!registerEmail()) {
                logger.logError('Email cannot be empty.', null, 'login', true);
                return;
            }

            // Check empty passwords
            if (!registerPassword1() || !registerPassword2()) {
                logger.logError('Passwords cannot be empty.', null, 'login', true);
                return;
            }

            var hash = CryptoJS.SHA256(registerPassword1()).toString();
            var firstName = fullNameArray[0],
                // Get last name declared
                lastName = fullNameArray[fullNameArray.length - 1];

            // Attempt registration
            return session.register(firstName, lastName, registerEmail(), hash, printRegistrationErrors)
                // If registration was successful
                // OR user registered with his own pre-existing account
                .then(function (sessionUser) {
                    if (sessionUser) {
                        router.navigate('#join-house');
                        return router.activate('join-house');
                    }
                });
        }

        function printRegistrationErrors(data) {

            // Notify user of errors if data comes back
            if (data.errors) {

                for (var i = 0; i < data.errors.length; i++) {

                    console.log(data.errors[i]);
                    logger.logError(data.errors[i], null, 'login', true);
                }
            }
        };

    });