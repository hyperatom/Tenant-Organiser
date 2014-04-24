define(['config'], function (config) {

    var model = {
        configureMetadataStore: configureMetadataStore,
        userInitializer: userInitializer,
        getNextBill: getNextBill
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
        metadataStore.registerEntityTypeCtor(
            'BillType', null, billTypeInitializer);
        metadataStore.registerEntityTypeCtor(
            'BillInvoice', null, billInvoiceInitializer);
        metadataStore.registerEntityTypeCtor(
            'InvoiceRecipient', null, invoiceRecipientInitializer);
        metadataStore.registerEntityTypeCtor(
            'UserSettings', null, userSettingsInitializer);
        metadataStore.registerEntityTypeCtor(
            'BinRota', null, binRotaInitializer);
        metadataStore.registerEntityTypeCtor(
            'CleaningRota', null, cleaningRotaInitializer);
    }

    function invoiceRecipientInitializer(invoiceRecipientObservable) {
        invoiceRecipientObservable.PrettyAmount = ko.computed(function () {
            return '£' + invoiceRecipientObservable.Amount().toFixed(2);
        });
    }
    
    function billInvoiceInitializer(invoiceObservable) {

        invoiceObservable.PrettyDueDate = ko.computed(function () {
            return moment(invoiceObservable.DueDate().toString()).format('MMMM Do YYYY').toString();
        });
    }

    function billTypeInitializer(billTypeObservable) {
        // Initialise the currently viewed invoice for the bill
        billTypeObservable.currentInvoice = ko.observable(getNextBill(billTypeObservable));
    }

    function getNextBill(billTypeObservable) {
        if (!billTypeObservable.BillInvoices())
            return null;

        // Initialise minimum date
        var closestDate = moment("26/03/1992", "DD/MM/YYYY");

        var results = $.grep(billTypeObservable.BillInvoices(), function (invoice) {
            // Difference in time from due date to today
            var diff1 = Math.abs(moment(invoice.DueDate()).diff(moment(), 'days'));
            // Difference in time from minimum due date to today
            var diff2 = Math.abs(moment(closestDate).diff(moment(), 'days'));

            var isCloser = diff1 < diff2 ? true : false;
            // Is the current difference smaller than the found minimum
            closestDate = diff1 < diff2 ? invoice.DueDate() : closestDate;
            return isCloser;
        });

        // Return the closest upcoming bill invoice which is the last element added
        return results[results.length - 1];
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

    function userSettingsInitializer(userSettingsObservable) {

        userSettingsObservable.PrettyBinRotaGroup = ko.computed(function () {
            if (!userSettingsObservable.BinCollectionRotaGroup())
                return "No Group";

            return "Group " + userSettingsObservable.BinCollectionRotaGroup();
        });

        userSettingsObservable.PrettyCleaningRotaGroup = ko.computed(function () {
            if (!userSettingsObservable.CleaningRotaGroup())
                return "No Group";

            return "Group " + userSettingsObservable.CleaningRotaGroup();
        });
    }

    function binRotaInitializer(binRotaObservable) {

        binRotaObservable.OccuranceDays = ko.computed({

            read: function () {
                switch (binRotaObservable.Occurance()) {
                    case "Daily": return 1;
                    case "Weekly": return 7;
                    case "Fortnightly": return 14;
                    case "Monthly": return; // Special case, begin on X day of each month
                }
            },

            write: function (value) {
                switch (value) {
                    case 1: return "Daily";
                    case 7: return "Weekly";
                    case 14: return "Fortnightly";
                }
            }
        });

        binRotaObservable.Log = ko.observable();
        binRotaObservable.TaskTenants = ko.observable();
        binRotaObservable.RotaGroup = ko.observable();

        binRotaObservable.PrettyStartDate = ko.computed({

            read: function () {
                return moment(binRotaObservable.StartDate()).format("DD/MM/YYYY").toString();
            },

            write: function (value) {
                binRotaObservable.StartDate(moment(value, "DD/MM/YYYY").toString());
            }
        });
    }

    function cleaningRotaInitializer(cleaningRotaObservable) {

        cleaningRotaObservable.OccuranceDays = ko.computed({

            read: function () {
                switch (cleaningRotaObservable.Occurance()) {
                    case "Daily": return 1;
                    case "Weekly": return 7;
                    case "Fortnightly": return 14;
                    case "Monthly": return; // Special case, begin on X day of each month
                }
            },

            write: function (value) {
                switch (value) {
                    case 1: return "Daily";
                    case 7: return "Weekly";
                    case 14: return "Fortnightly";
                }
            }
        });

        cleaningRotaObservable.Cleaned = ko.observable(false);
        cleaningRotaObservable.Log = ko.observable();
        cleaningRotaObservable.TaskTenants = ko.observable();
        cleaningRotaObservable.RotaGroup = ko.observable();

        cleaningRotaObservable.PrettyStartDate = ko.computed({

            read: function () {
                return moment(cleaningRotaObservable.StartDate()).format("DD/MM/YYYY").toString();
            },

            write: function (value) {
                cleaningRotaObservable.StartDate(moment(value, "DD/MM/YYYY").toString());
            }
        });
    }
});