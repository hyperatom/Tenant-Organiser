/**
 * A module used to intercept breeze.js entities from the database for configuration.
 * Additional properties and computed properties are added to entities from this module.
 * 
 * @module services/model
 */
define(['../config'], function (config) {

    var model = {
        configureMetadataStore: configureMetadataStore,
        userInitializer: userInitializer,
        getNextBill: getNextBill
    };

    return model;

    /** 
     * Configures the metadata store by specifying entity initialisers for each entity type.
     * 
     * @name module:services/model#configureMetadataStore
     * @public
     * @function
     * @param {Object} metadataStore - The metadatastore to be used for entity initialisations.
     */
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

    /** 
     * Gets the next bill that occurs based on state of the specified bill object.
     * 
     * @name module:services/model#getNextBill
     * @public
     * @function
     * @param {Object} invoiceRecipientObservable - The invoice recipient object to be initialised.
     */
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

    /** 
     * Initialises the invoice recipient entity with additional properties.
     * 
     * @name module:services/model#invoiceRecipientInitializer
     * @private
     * @function
     * @param {Object} invoiceRecipientObservable - The invoice recipient object to be initialised.
     */
    function invoiceRecipientInitializer(invoiceRecipientObservable) {
        invoiceRecipientObservable.PrettyAmount = ko.computed(function () {
            return '£' + invoiceRecipientObservable.Amount().toFixed(2);
        });
    }

    /** 
     * Initialises the bill invoice entity with additional properties.
     * 
     * @name module:services/model#billInvoiceInitializer
     * @private
     * @function
     * @param {Object} invoiceObservable - The bill invoice object to be initialised.
     */
    function billInvoiceInitializer(invoiceObservable) {

        invoiceObservable.PrettyDueDate = ko.computed(function () {
            return moment(invoiceObservable.DueDate().toString()).format('MMMM Do YYYY').toString();
        });
    }

    /** 
     * Initialises the bill type entity with additional properties.
     * 
     * @name module:services/model#billTypeInitializer
     * @private
     * @function
     * @param {Object} billTypeObservable - The bill type object to be initialised.
     */
    function billTypeInitializer(billTypeObservable) {
        // Initialise the currently viewed invoice for the bill
        billTypeObservable.currentInvoice = ko.observable(getNextBill(billTypeObservable));
    }

    /** 
     * Initialises the conversation entity with additional properties.
     * 
     * @name module:services/model#conversationInitializer
     * @private
     * @function
     * @param {Object} conversationObservable - The conversation object to be initialised.
     */
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

    /** 
     * Initialises the communal message entity with additional properties.
     * 
     * @name module:services/model#communalMessageInitializer
     * @private
     * @function
     * @param {Object} messageObservable - The communal message object to be initialised.
     */
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

    /** 
     * Initialises the activity log entity with additional properties.
     * 
     * @name module:services/model#activityLogInitializer
     * @private
     * @function
     * @param {Object} activityObservable - The activity log object to be initialised.
     */
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

    /** 
     * Initialises the user entity with additional properties.
     * 
     * @name module:services/model#userInitializer
     * @public
     * @function
     * @param {Object} userObservable - The user object to be initialised.
     */
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

    /** 
     * Initialises the user settings entity with additional properties.
     * 
     * @name module:services/model#userSettingsInitializer
     * @private
     * @function
     * @param {Object} userSettingsObservable - The user settings object to be initialised.
     */
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

    /** 
     * Initialises the bin rota entity with additional properties.
     * 
     * @name module:services/model#binRotaInitializer
     * @private
     * @function
     * @param {Object} binRotaObservable - The bin rota object to be initialised.
     */
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

    /** 
     * Initialises the cleaning rota entity with additional properties.
     * 
     * @name module:services/model#cleaningRotaInitializer
     * @private
     * @function
     * @param {Object} cleaningRotaObservable - The cleaning rota object to be initialised.
     */
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