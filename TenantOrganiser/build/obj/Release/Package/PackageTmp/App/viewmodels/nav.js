define(['services/logger', 'plugins/router', 'services/session', 'services/fbhelper'],
    function (logger, router, session, fb) {

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

        if (session.sessionUser().IsFacebookUser())
            fb.logout();

        return session.logout().then(function () { router.navigate('#login') });
    }
});