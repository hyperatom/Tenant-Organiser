﻿/**
 * View model for the Add Bill Invoice view. 
 * Performs tasks which aids the creation of a new bill invoice.
 * 
 * @module viewmodels/add-bill-invoice
 */
define(['services/logger', 'plugins/router', 'services/datacontext', 'services/session', 'services/helper'],

    function (logger, router, datacontext, session, helper) {

        var pageHeader = new ko.observable();

        var billType = new ko.observable();
        var billInvoice = new ko.observable();
        var invoiceRecipients = new ko.observableArray();
        var newInvoiceRecipient = new ko.observableArray();

        var isUndoEnabled = new ko.observable(false);

        var tenantsList = new ko.observableArray();

        var totalAmount = new ko.observable(0);
        var dueDate = new ko.observable();

        var recipientAmountChanging = false;
        var totalAmountChanging = false;

        var vm = {
            activate: activate,
            deactivate: deactivate,
            title: 'Add Bill Invoice View',
            attached: viewAttached,

            billType: billType,
            billInvoice: billInvoice,
            pageHeader: pageHeader,

            clickedCombo: clickedCombo,
            checkboxClicked: checkboxClicked,

            invoiceRecipients: invoiceRecipients,
            newInvoiceRecipient: newInvoiceRecipient,

            totalAmount: totalAmount,
            dueDate: dueDate,

            addNewRecipient: addNewRecipient,
            removeRecipient: removeRecipient,

            invoiceCreated: invoiceCreated,
            invoiceUndone: invoiceUndone,

            tenantsList: tenantsList,
            isUndoEnabled: isUndoEnabled
        };

        return vm;

        /** 
         * Activates the view model by initialising required data.
         * 
         * @name module:viewmodels/add-bill-invoice#activate
         * @public
         * @function
         * @param {number} billTypeId - ID of the bill type to create an invoice for.
         * @returns {Object} A promise returned when all asynchronous queries have completed. 
         */
        function activate(billTypeId) {
            return Q.all([refreshTenants(), refreshBillType(billTypeId), initNewBillInvoice(), initNewRecipient()]).then(function () {
                pageHeader("New " + billType().Name() + " Invoice");
                logger.log('Add Bill Invoice Activated', null, 'add-bill-invoice', true);
            });
        }

        /** 
         * Called when the page is exited.
         * Resets data to default values to prevent duplications upon page re-entry.
         * 
         * @name module:viewmodels/add-bill-invoice#deactivate
         * @public
         * @function
         */
        function deactivate() {
            billType(null);
            totalAmount(null);
            invoiceRecipients([]);
            dueDate(null);
        }

        /** 
         * Called when the view is attached to this view model.
         * Initialises the datepicker and subscribes to the total amount text field.
         * 
         * @name module:viewmodels/add-bill-invoice#viewAttached
         * @public
         * @function
         */
        function viewAttached() {
            ko.observable.fn.beforeAndAfterSubscribe = function (callback, target) {
                var _oldValue;
                target.subscribe(function (oldValue) {
                    _oldValue = oldValue;
                }, null, 'beforeChange');
                target.subscribe(function (newValue) {
                    callback(target, _oldValue, newValue);
                });
            };

            $(".input-group.date").datepicker({ autoclose: true, todayHighlight: true });
            ko.observable.fn.beforeAndAfterSubscribe(totalAmountChanged, totalAmount);
        }

        /** 
         * Refreshes the current list of tenants and removes those that are already an invoice recipient.
         * This prevents users adding the same recipient twice.
         * 
         * @name module:viewmodels/add-bill-invoice#refreshTenants
         * @public
         * @function
         * @returns {Object} Promise returned when the query is complete.
         */
        function refreshTenants() {
            return datacontext.getUsersByHouse(tenantsList, session.sessionUser().HouseId()).then(function() {
                helper.removeCommonTenants(tenantsList, invoiceRecipients);
            });
        }

        /** 
         * Refreshes the current bill type being used to create the new invoice.
         * 
         * @name module:viewmodels/add-bill-invoice#refreshBillType
         * @public
         * @function
         * @param {number} id - Id of the bill type to create the invoice for.
         * @returns {Object} Promise returned when the query is complete.
         */
        function refreshBillType(id) {
            return datacontext.getBillTypeById(billType, id);
        }

        /** 
         * Initialises a new bill invoice using the current bill type and list of added recipients.
         * 
         * @name module:viewmodels/add-bill-invoice#initNewBillInvoice
         * @public
         * @function
         * @returns {Object} Promise returned when the query is complete.
         */
        function initNewBillInvoice() {
            return billInvoice({ BillType: billType(), Recipients : ko.observableArray() });
        }

        /** 
         * Initialises a new invoice recipient using the values of the associated observables.
         * 
         * @name module:viewmodels/add-bill-invoice#initNewRecipient
         * @public
         * @function
         */
        function initNewRecipient() {
            newInvoiceRecipient({ User: ko.observable({ FullName: ko.observable('Select a recipient') }), BillInvoice: billInvoice(), Paid: ko.observable(false), Amount: ko.observable() });
        }

        /** 
         * Creates a new bill invoice using the associated observable values.
         * 
         * @name module:viewmodels/add-bill-invoice#invoiceCreated
         * @public
         * @function
         * @returns {Object} Promise returned when the entity is saved.
         */
        function invoiceCreated() {

            // Validate new invoice
            if (!dueDate()) {
                logger.logError("Please enter a due date for the invoice.", null, 'add-bill-invoice', true);
                return;
            }

            var newInvoice = datacontext.createBillInvoice(billType());

            // Format to american style since breeze requires this
            newInvoice.DueDate(moment(dueDate(), 'DD/MM/YYYY').format('MM/DD/YYYY'));

            // Creates new bill invoice allowing us to attach navigation properites
            return datacontext.saveChanges().then(createRecipients);

            function createRecipients() {

                $.each(invoiceRecipients(), function(i, recip) {
                    var newRecip = datacontext.createInvoiceRecipient(newInvoice);
  
                    newRecip.Amount(recip.Amount());
                    newRecip.Paid(recip.Paid());
                    newRecip.User(recip.User());
                });

                return datacontext.saveChanges().then(function() {
                    logger.logSuccess('Invoice Created!', null, 'add-bill-invoice', true);
                    return router.navigate('#bills');
                });
            }
        }

        /** 
         * Resets the list of recipients, total amount and due date observables to their default values.
         * 
         * @name module:viewmodels/add-bill-invoice#invoiceUndone
         * @public
         * @function
         */
        function invoiceUndone() {
            ko.utils.arrayForEach(invoiceRecipients(), function (recip) { invoiceRecipients.removeAll(); });
            totalAmount(0);
            dueDate('');
            refreshTenants();
            logger.log('Changes undone!', null, 'add-bill-invoice', true);
        }

        /** 
         * Updates the total amount to reflect the sum of all recipients invoices when
         * a change in a recipients amount is detected.
         * 
         * @name module:viewmodels/add-bill-invoice#recipientAmountChanged
         * @public
         * @function
         * @param {number} newValue - New value of a recipients invoice amount.
         * @returns {Object} Promise returned when the entity is saved.
         */
        function recipientAmountChanged(newValue) {

            recipientAmountChanging = true;

            var total = 0;

            ko.utils.arrayForEach(invoiceRecipients(), function (recip) { console.log(total += parseInt(recip.Amount())); });

            if (totalAmountChanging == false)
                totalAmount(total);

            recipientAmountChanging = false;
        }


        /** 
         * Updates the invoice amount of all added invoice recipients to reflect
         * a change detected for the total amount.
         * 
         * @name module:viewmodels/add-bill-invoice#totalAmountChanged
         * @public
         * @function
         * @param {number} oldValue - Old value of the total amount.
         * @param {number} newValue - New value of the total amount.
         */
        function totalAmountChanged(target, oldValue, newValue) {
            var size = invoiceRecipients().length;

            if (oldValue != newValue && newValue != "" && size > 0 && recipientAmountChanging == false) {
                var sharedAmount = newValue / size;
                totalAmountChanging = true;
                ko.utils.arrayForEach(invoiceRecipients(), function (recip) { recip.Amount(sharedAmount) });
                totalAmountChanging = false;
            }
        }

        /** 
         * Adds a specified recipient to the observable array of invoice recipients. 
         * 
         * @name module:viewmodels/add-bill-invoice#addNewRecipient
         * @public
         * @function
         * @param {Object} recipient - Recipient to add to the list of observable recipients.
         */
        function addNewRecipient(recipient) {

            // Validate new recipient
            if (!recipient.Amount()) {
                logger.logError("Please enter a bill amount for the new recipient.", null, 'add-bill-invoice', true);
                return;
            }

            if (recipient.User().FullName() === "Select a recipient") {
                logger.logError("Please choose a recipient from the combo box.", null, 'add-bill-invoice', true);
                return;
            }

            recipient.Amount.subscribe(recipientAmountChanged);
            invoiceRecipients.push(recipient);
            recipient.Amount.notifySubscribers();

            refreshTenants();

            initNewRecipient();
        }

        /** 
         * Removes a specified recipient from the observable array of invoice recipients. 
         * 
         * @name module:viewmodels/add-bill-invoice#removeRecipient
         * @public
         * @function
         * @param {Object} recipient - Recipient to remove from the list of observable recipients.
         */
        function removeRecipient(recipient) {

            invoiceRecipients.remove(recipient);
            recipient.Amount.notifySubscribers();

            refreshTenants();
        }

        /** 
         * Sets the value of the new invoice recipient to the specified tenant.
         * 
         * @name module:viewmodels/add-bill-invoice#clickedCombo
         * @public
         * @function
         * @param {Object} tenant - Tenant to be set to the value of the new recipient.
         * @param {Object} newInvoiceRecipient - New recipient to be set to the chosen tenant.
         */
        function clickedCombo(tenant, newInvoiceRecipient) {
            newInvoiceRecipient.User(tenant);
        }

        /** 
         * Inverts the invoice paid status of a specified recipient.
         * 
         * @name module:viewmodels/add-bill-invoice#checkboxClicked
         * @public
         * @function
         * @param {Object} newInvoiceRecipient - Recipient to have their paid status inverted.
         */
        function checkboxClicked(newInvoiceRecipient) {

            if (!newInvoiceRecipient.Paid()) {
                newInvoiceRecipient.Paid(true);
                logger.logSuccess(newInvoiceRecipient.User().FullName().concat(' has now paid.'), null, 'add-bill-invoice', true);
            } else {
                newInvoiceRecipient.Paid(false);
                logger.logSuccess(newInvoiceRecipient.User().FullName().concat(' has now un-paid.'), null, 'add-bill-invoice', true);
            }
        }
    });