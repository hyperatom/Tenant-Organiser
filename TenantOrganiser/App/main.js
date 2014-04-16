requirejs.config({
    shim: {
        'facebook': {
            exports: 'FB'
        }
    },
    paths: {
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions',
        'facebook': '//connect.facebook.net/en_US/all'
    }
});

require(['fb']);
define('jquery', function () { return jQuery; });
define('knockout', ko);


define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'plugins/router', 'services/logger'], boot);


function boot(app, viewLocator, system, router, logger, facebook) {

    // Enable debug message to show in the console 
    system.debug(true);

    //specify which plugins to install and their configuration
    app.configurePlugins({
        router: true,
        dialog: true,
        widget: {
            kinds: ['expander']
        }
    });

    app.start().then(function () {
        toastr.options.positionClass = 'toast-bottom-right';
        toastr.options.backgroundpositionClass = 'toast-bottom-right';

        viewLocator.useConvention();

        //Show the app by setting the root view model for our application.
        app.setRoot('viewmodels/shell', 'entrance');
    });
};