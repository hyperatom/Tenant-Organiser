/**
 * View model for the Tenants view.
 * Performs tasks associated with displaying house tenants.
 * 
 * @module viewmodels/nav
 */
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

        /** 
        * Activates the view model by initialising required data.
        * 
        * @name module:viewmodels/tenants#activate
        * @public
        * @function
        * @returns {Object} Promise returned when the tenants have been retrieved.
        */
        function activate() {
            return refreshTenants().then(function () {
                logger.log('Tenants View Activated', null, 'tenants', true);
            });
        }

        /** 
        * Refreshes the list of tenants associated with the session user's house.
        * 
        * @name module:viewmodels/tenants#refreshTenants
        * @public
        * @function
        * @returns {Object} Promise returned when the tenants have been retrieved.
        */
        function refreshTenants() {
            return datacontext.getUsersByHouse(tenantsList, session.sessionUser().House().Id());
        }

        /** 
        * Navigates to the messages page and creates a new conversation with the
        * specified tenant.
        * 
        * @name module:viewmodels/tenants#composeMessageToTenant
        * @public
        * @function
        */
        function composeMessageToTenant(tenant) {
            router.navigate('#messages/' + tenant.Id());
        }
    });