define(['services/logger', 'plugins/router', 'services/session'], function (logger, router, session) {

    var vm = {
        activate: activate,
        title: 'Navigation View',

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

    function activate() {
        logger.log('Navigation View Activated', null, 'nav', true);
        return true;
    }

    function getUserFullName() {
        return session.sessionUser().FirstName() + " " + session.sessionUser().LastName();
    }

    function logoutClicked() {

        session.logout().then(function () {
            router.navigate('#login');
        });
    }
});