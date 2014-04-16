define(['services/logger', 'services/datacontext', 'services/session', 'plugins/router'], function (logger, datacontext, session, router) {

    var houseName = ko.observable();

    var messageFeed = ko.observableArray();
    var activityFeed = ko.observableArray();

    var messageInput = ko.observable();

    var vm = {
        activate: activate,
        attached: viewAttached,
        title: 'Home',

        activityFeed: activityFeed,
        messageFeed: messageFeed,

        messageInput: messageInput,

        addMessage: addMessage,
        deleteMessage: deleteMessage,

        houseName: houseName
    };

    return vm;

    function activate() {

        houseName(session.sessionUser().House().HouseName);

        return Q.all([refreshAnnouncements(), refreshActivityLogs()]).then(function () {
            logger.log('Home View Activated', null, 'home', true);
        });
    }

    function viewAttached() {

        $('#message-box').keypress(checkEnterKeyPressed);
    }

    function refreshAnnouncements() {
        return datacontext.getAnnouncements(messageFeed, session.sessionUser().HouseId());
    }

    function refreshActivityLogs() {
        return datacontext.getActivitiyLogs(activityFeed, session.sessionUser().HouseId());
    }

    function deleteMessage(message) {
        var tmp = message;
        messageFeed.remove(message);
        return datacontext.deleteCommunalMessage(tmp).then(refreshAnnouncements);
    }

    function checkEnterKeyPressed(event) {

        var keycode = (event.keyCode ? event.keyCode : event.which);

        if (keycode == '13') {
            addMessage();
        }
    }

    function addMessage() {

        if (!messageInput()) {
            logger.logError('Message cannot be empty.', null, 'home', true);
            return;
        }

        var messageEntity = datacontext.createAnnouncement();

        messageEntity.Content(messageInput());
        messageEntity.SentDate(moment().toString());
        messageEntity.User(session.sessionUser());
        messageEntity.House(session.sessionUser().House());

        return datacontext.saveChanges().then(function () {
            messageInput('');
        }).then(refreshAnnouncements);
    }
});