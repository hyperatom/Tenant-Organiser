define(['services/logger', 'services/datacontext', 'services/session'],
    function (logger, datacontext, session) {

        var vm = {
            activate: activate,
            title: 'Create Bill Type',
        };

        return vm;

        function activate() {
            return true;
        }

        
    });