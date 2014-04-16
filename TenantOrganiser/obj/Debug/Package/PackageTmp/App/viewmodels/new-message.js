define(['services/logger'], function (logger) {
    var vm = {
        activate: activate,
        title: 'New Message'
    };

    return vm;

    //#region Internal Methods
    function activate() {
        logger.log('New Message View Activated', null, 'new-message', true);
        return true;
    }
    //#endregion
});