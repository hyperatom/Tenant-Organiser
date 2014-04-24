define(['durandal/system', 'plugins/router', 'services/logger', 'services/datacontext', 'services/session'],
    function (system, router, logger, datacontext, session) {

        // Redirecting from / to first route in route.map
        router.guardRoute = function (routeInfo, params, instance) {

            var insecureRoutes = ['login'];
            // False if route is not public
            var isFragmentPublic = ($.inArray(params.fragment, insecureRoutes) == -1) ? false : true;

            // Allow navigation if page is public
            if (isFragmentPublic)
                return true;

            if (params.fragment === 'join-house') {
                // If the logged in user is not assigned a house
                if (!session.sessionUser().House())
                    return true;
                else
                    return '#home';
            }

            if (session.sessionUser() && !session.sessionUser().House()) {
                return '#join-house';
            }

            // Allow navigation if user is logged in
            if (session.sessionUser())
                return true;

            // If user is denied access, show login page
            return '#login';
        };

        var shell = {
            activate: activate,
            router: router,
            sessionUser: session.sessionUser
        };
        
        return shell;

        //#region Internal Methods
        function activate() {

            return datacontext.primeData().then(function() {
                return session.refreshSession();
            }).then(boot);
        }

        function boot() {

            // moduleId: 'viewmodels/xxx', becomes moduleId: 'xxx'
            router.makeRelative({ moduleId: 'viewmodels' });

            return router.map([
                { route: '', moduleId: 'home', nav: true },
                { route: 'home', moduleId: 'home', nav: true },
                { route: 'account-settings', moduleId: 'account-settings', nav: true },
                { route: 'add-bill-invoice/:billname', moduleId: 'add-bill-invoice', nav: true },
                { route: 'edit-bill-invoice/:billname', moduleId: 'edit-bill-invoice', nav: true },
                { route: 'bills', moduleId: 'bills', nav: true },
                { route: 'edit-bin-rota', moduleId: 'edit-bin-rota', nav: true },
                { route: 'edit-cleaning-rota', moduleId: 'edit-cleaning-rota', nav: true },
                { route: 'login', moduleId: 'login', nav: true },
                { route: 'messages', moduleId: 'messages', nav: true },
                { route: 'messages/:recipId', moduleId: 'messages', nav: true },
                { route: 'new-message', moduleId: 'new-message', nav: true },
                { route: 'tasks', moduleId: 'tasks', nav: true },
                { route: 'tenants', moduleId: 'tenants', nav: true },
                { route: 'wish-list', moduleId: 'wish-list', nav: true },
                { route: 'join-house', moduleId: 'join-house', nav: true }
            ]).buildNavigationModel()
              .mapUnknownRoutes('home')
              .activate();
        }

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(shell), showToast);
        }
        //#endregion
    });