define(['services/logger', 'services/datacontext', 'services/session'], function (logger, datacontext, session) {

    var tenantsList = new ko.observableArray();

    var vm = {
        activate: activate,
        title: 'Tenants',

        tenantsList: tenantsList
    };

    return vm;


    function activate() {
        return refreshTenants().then(function () {
            logger.log('Tenants View Activated', null, 'tenants', true);
        });
    }

    function refreshTenants() {
        return datacontext.getTenants(tenantsList, session.sessionUser().House().Id());
    }


});