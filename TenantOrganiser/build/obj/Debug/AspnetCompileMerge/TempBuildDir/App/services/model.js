define(['config'], function (config) {

    var model = {
        configureMetadataStore: configureMetadataStore,
        userInitializer: userInitializer
    };

    return model;

    function configureMetadataStore(metadataStore) {

        metadataStore.registerEntityTypeCtor(
            'User', null, userInitializer);
        metadataStore.registerEntityTypeCtor(
            'CommunalMessage', null, communalMessageInitializer);
        metadataStore.registerEntityTypeCtor(
            'ActivityLog', null, activityLogInitializer);
        metadataStore.registerEntityTypeCtor(
            'Conversation', null, conversationInitializer);
    }

    function conversationInitializer(conversationObservable) {
        conversationObservable.RecipientsString = ko.computed({

            read: function () {

                // If no users return empty string
                if (!conversationObservable.ConversationUsers())
                    return "";

                switch (conversationObservable.ConversationUsers().length) {
                    case 0:
                        return "";
                    case 1:
                        return conversationObservable.ConversationUsers()[0].User().FirstName();
                    case 2:
                        return conversationObservable.ConversationUsers()[0].User().FirstName() + ", " +
                               conversationObservable.ConversationUsers()[1].User().FirstName() + ":";
                    default:
                        return conversationObservable.ConversationUsers()[0].User().FirstName() + ", " +
                               conversationObservable.ConversationUsers()[1].User().FirstName() + ", " +
                               (conversationObservable.ConversationUsers().length - 2) + " others:";
                }
            },

            // Gives 'Users' navigation property chance to load
            deferEvaluation: true
        });
    }

    function communalMessageInitializer(messageObservable) {
        messageObservable.TimeElapsed = ko.computed(function () {
            return moment.utc(messageObservable.SentDate()).fromNow();
        });

        messageObservable.DisplayMessage = ko.computed({
            read: function () {
                // Prevents issues when deleting
                if (messageObservable.User()) {
                    return messageObservable.Content() + " -- " +
                        messageObservable.User().FirstName() + " " +
                        messageObservable.User().LastName();
                }

                return messageObservable.Content();
            },

            // Gives FirstName and LastName chance to load
            deferEvaluation: true
        });
    }

    function activityLogInitializer(activityObservable) {

        activityObservable.TimeElapsed = ko.computed(function () {
            return moment.utc(activityObservable.Date()).fromNow();
        });

        activityObservable.DisplayMessage = ko.computed({
            read: function () {
                return activityObservable.User().FirstName() + " " +
                    activityObservable.User().LastName() + " " +
                    activityObservable.ActionMessage();
            },

            // Gives FirstName and LastName chance to load
            deferEvaluation: true
        });

        activityObservable.Icon = ko.computed(function () {

            var iconClass = 'glyphicon glyphicon-tag';

            switch (activityObservable.LogName()) {
                case "Bill":
                    return "glyphicon glyphicon-gbp";
                    break;
                case "Wish List":
                    return "glyphicon glyphicon-heart";
                    break;
                case "Bin Rota":
                    return "glyphicon glyphicon-trash";
                    break;
                case "Cleaning Rota":
                    return "glyphicon glyphicon-list";
                    break;
                case "House":
                    return "glyphicon glyphicon-home";
                    break;
                case "Tenant":
                    return "glyphicon glyphicon-user";
                    break;
                case "Message":
                    return "glyphicon glyphicon-envelope";
                    break;
            }

            return iconClass;
        });
    }

    function userInitializer(userObservable) {

        userObservable.FullName = ko.computed(function () {
            return userObservable.FirstName() + " " + userObservable.LastName();
        });

        userObservable.DisplayPictureFilePath = ko.computed(function () {
            if (!userObservable.DisplayPictureFileName())
                return config.profilePicturesDirectory + config.genericProfilePictureFileName;

            return config.profilePicturesDirectory + userObservable.DisplayPictureFileName();
        });
    }
});