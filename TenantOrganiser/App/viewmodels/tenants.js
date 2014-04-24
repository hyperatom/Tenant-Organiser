define(['services/logger', 'services/datacontext', 'services/session', 'plugins/router'],
    function (logger, datacontext, session, router) {

    var tenantsList = new ko.observableArray();

    var vm = {
        activate: activate,
        title: 'Tenants',

        tenantsList: tenantsList,
        composeMessageToTenant: composeMessageToTenant
    };

    return vm;


    function activate() {
        return refreshTenants().then(function () {
            logger.log('Tenants View Activated', null, 'tenants', true);
        });
    }

    function composeMessageToTenant(tenant) {
        router.navigate('#messages/' + tenant.Id());
    }

    function refreshTenants() {
        return datacontext.getTenants(tenantsList, session.sessionUser().House().Id());
    }


});