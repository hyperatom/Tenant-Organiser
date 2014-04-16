define(['services/logger', 'plugins/router', 'services/session', 'services/datacontext'],
    function (logger, router, session, datacontext) {

        var pageHeader = new ko.observable();

        var joinHouseCode = new ko.observable();

        var createHouseName = new ko.observable();
        var createHouseCode = new ko.observable();

        var houseJoinRequest = new ko.observable();

        var vm = {
            activate: activate,
            title: 'Join House',
            attached: viewAttached,

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


        function activate() {

            initPageHeader(pageHeader);

            logger.log('Join House View Activated', null, 'join-house', true);

            return refreshHouseJoinRequest();
        }

        function viewAttached() {

        }

        function logoutClicked() {
            return session.logout().then(function () { router.navigate('#login') });
        }

        function joinExistingHouseClicked() {
            return datacontext.joinHouse(session.sessionUser, joinHouseCode()).then(function () {
                return refreshHouseJoinRequest();
            });
        }

        function cancelRequestClicked(data) {
            // Copy to temp variable
            var req = houseJoinRequest();
            houseJoinRequest(null);
            return datacontext.cancelHouseRequest(req).then(refreshHouseJoinRequest);
        }

        function createNewHouseClicked() {
            return datacontext.createHouse(session.sessionUser, createHouseName(), createHouseCode()).then(session.refreshSession).then(function () {
                router.navigate('#home');
            });
        }

        function refreshHouseJoinRequest() {
            return datacontext.getUsersJoinRequest(session.sessionUser, houseJoinRequest);
        }

        function initPageHeader(pageHeaderObservable) {
            pageHeaderObservable("Welcome " + session.sessionUser().FirstName() + "!");
        }

    });