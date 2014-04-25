/**
 * View model for the Edit Bill Invoice view. 
 * Performs tasks associated with bill invoice management.
 * 
 * @module viewmodels/edit-bill-invoice
 */
define(['services/logger', 'plugins/router', 'services/datacontext', 'services/session', 'services/helper'],

    function (logger, router, datacontext, session, helper) {

        var initialised = false;

        var pageHeader = new ko.observable();
        var billType = new ko.observable();
        var billInvoice = new ko.observable();
        var dueDate = new ko.observable();

        var invoiceRecipients = new ko.observableArray();
        var newInvoiceRecipient = new ko.observableArray();
        var tenantsList = new ko.observableArray();

        var billName = new ko.observable('');

        var totalAmount = new ko.observable(0);

        var recipientAmountChanging = false;
        var totalAmountChanging = false;

        var vm = {
            activate: activate,
            title: 'Add Bill Invoice View',
            attached: viewAttached,

            pageHeader: pageHeader,
            billType: billType,
            billInvoice: billInvoice,
            dueDate: dueDate,

            billName: billName,

            clickedCombo: clickedCombo,
            checkboxClicked: checkboxClicked,

            invoiceRecipients: invoiceRecipients,
            newInvoiceRecipient: newInvoiceRecipient,

            totalAmount: totalAmount,

            addNewRecipient: addNewRecipient,
            removeRecipient: removeRecipient,

            invoiceSaved: invoiceSaved,
            invoiceDeleted: invoiceDeleted,
            invoiceUndone: invoiceUndone,

            tenantsList: tenantsList
        };

        return vm;

        /** 
         * Activates the view model by initialising required data.
         * 
         * @name module:viewmodels/edit-bill-invoice#activate
         * @public
         * @function
         * @param {number} invoiceId - Id of the invoice to be edited.
         * @returns {Object} A promise returned when all asynchronous queries have completed. 
         */
        function activate(invoiceId) {
            return Q.all([refreshTenants(), refreshInvoice(invoiceId), refreshBillType()]).then(function () {
                pageHeader("Edit " + billType().Name() + " Invoice");
                invoiceRecipients(billInvoice().Recipients().slice());
                initNewRecipient();

                var amount = 0;
                // Accumulate the amounts each recipient owes and set as total amount value
                ko.utils.arrayForEach(invoiceRecipients(), function (recip) {
                    recip.Amount.subscribe(recipientAmountChanged);
                    amount += recip.Amount();
                });

                totalAmount(amount.toFixed(2));
                dueDate(moment(billInvoice().DueDate()).format('DD/MM/YYYY'));
                logger.log('Add Bill Invoice Activated', null, 'edit-bill-invoice', true);
            });
        }

        /** 
         * Refreshes the list of tenants associated with the session user's house.
         * 
         * @name module:viewmodels/edit-bill-invoice#refreshTenants
         * @public
         * @function
         * @returns {Object} A promise returned when the tenants have been retrieved.
         */
        function refreshTenants() {
            return datacontext.getUsersByHouse(tenantsList, session.sessionUser().HouseId()).then(function () {
                helper.removeCommonTenants(tenantsList, invoiceRecipients);
            });
        }

        /** 
         * Refreshes the current invoice being edited.
         * 
         * @name module:viewmodels/edit-bill-invoice#refreshInvoice
         * @public
         * @function
         * @param {number} id - Id of the invoice to be refreshed.
         * @returns {Object} A promise returned when the invoice has been retrieved.
         */
        function refreshInvoice(id) {
            return datacontext.getInvoiceById(billInvoice, id);
        }

        /** 
         * Refreshes the bill type of the current invoice being edited.
         * 
         * @name module:viewmodels/edit-bill-invoice#refreshBillType
         * @public
         * @function
         * @param {number} id - Id of the bill type to be refreshed.
         * @returns {Object} A promise returned when the bill type has been retrieved.
         */
        function refreshBillType() {
            return billType(billInvoice().BillType());
        }

        /** 
         * Called when a view has been attached to this view model.
         * Listens for changes in the total amount observable and updates 
         * values of recipients accordingly.
         * Also initialises the datepicker field.
         * 
         * @name module:viewmodels/edit-bill-invoice#viewAttached
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
         * Saves the changes made to the invoice being edited and navigates
         * the user back to the bills view.
         * 
         * @name module:viewmodels/edit-bill-invoice#invoiceSaved
         * @public
         * @function
         * @returns {Object} Promise returned when the invoice changes have been saved.
         */
        function invoiceSaved() {
            return datacontext.saveChanges().then(saveSuccess);

            function saveSuccess() {
                router.navigate('#bills');
                logger.logSuccess('Invoice Saved!', null, 'edit-bill-invoice', true);
            }
        }

        /** 
         * Deletes the invoice currently being edited and its associated recipients.
         * Navigates the user back to the bills view.
         * 
         * @name module:viewmodels/edit-bill-invoice#invoiceDeleted
         * @public
         * @function
         * @returns {Object} Promise returned when the invoice has been deleted.
         */
        function invoiceDeleted() {
            ko.utils.arrayForEach(invoiceRecipients().slice(), function (recip) {
                if (recip) {
                    invoiceRecipients.remove(recip);
                    recip.entityAspect.setDeleted();
                }
            });

            billInvoice().entityAspect.setDeleted();

            return datacontext.saveChanges().then(function () {
                router.navigate('#bills');
                logger.logSuccess('Invoice Deleted!', null, 'edit-bill-invoice', true);
            });
        }

        /** 
         * Resets any changes made to the invoice being edited to the state
         * it was when it was last saved.
         * 
         * @name module:viewmodels/edit-bill-invoice#invoiceUndone
         * @public
         * @function
         */
        function invoiceUndone() {

            invoiceRecipients([]);
            datacontext.rejectChanges();
            invoiceRecipients(billInvoice().Recipients().slice());
            refreshTenants();

            initNewRecipient();

            var amount = 0;

            ko.utils.arrayForEach(invoiceRecipients(), function (recip) {
                recip.Amount.subscribe(recipientAmountChanged);
                amount += recip.Amount();
            });

            totalAmount(amount.toFixed(2));

            dueDate(moment(billInvoice().DueDate()).format('DD/MM/YYYY'));

            logger.log('Changes undone!', null, 'edit-bill-invoice', true);
        }

        /** 
         * Changes the total amount observable to the sum of all recipient invoice
         * amounts. This is recalculated each time a change is made to a recipient's invoice amount.
         * 
         * @name module:viewmodels/edit-bill-invoice#recipientAmountChanged
         * @public
         * @function
         * @param {number} newValue - New value of the recipients invoice amount.
         */
        function recipientAmountChanged(newValue) {
            recipientAmountChanging = true;

            var total = 0;
            ko.utils.arrayForEach(invoiceRecipients(), function (recip) { total += recip.Amount(); });

            if (totalAmountChanging == false)
                totalAmount(total.toFixed(2));

            recipientAmountChanging = false;
        }

        /** 
         * Shares the total amount value out between all invoice recipients equally when changed.
         * 
         * @name module:viewmodels/edit-bill-invoice#totalAmountChanged
         * @public
         * @function
         * @param {number} oldValue - Old value of the total amount observable.
         * @param {number} newValue - New value of the total amount observable.
         */
        function totalAmountChanged(target, oldValue, newValue) {
            var size = invoiceRecipients().length;

            if (oldValue != newValue && newValue != "" && size > 0 && recipientAmountChanging == false) {
                var sharedAmount = newValue / size;
                totalAmountChanging = true;
                ko.utils.arrayForEach(invoiceRecipients(), function (recip) { recip.Amount(sharedAmount.toFixed(2)) });
                totalAmountChanging = false;
            }
        }

        /** 
         * Adds a new recipient to the local list of invoice recipients.
         * 
         * @name module:viewmodels/edit-bill-invoice#addNewRecipient
         * @public
         * @function
         * @param {Object} recipient - Recipient to be added to the list of invoice recipients.
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

            var newRecip = datacontext.createInvoiceRecipient(billInvoice());

            try {
                newRecip.User(recipient.User());
                newRecip.Amount(recipient.Amount());
            } catch (e) {
                newRecip.entityAspect.setDeleted();
                logger.logError("This recipient has already been added.", null, 'add-bill-invoice', true);
                return;
            }

            invoiceRecipients.push(newRecip);
            newRecip.Amount.subscribe(recipientAmountChanged);
            newRecip.Amount.notifySubscribers();

            refreshTenants();

            initNewRecipient();
        }

        /** 
         * Removes a new recipient from the local list of invoice recipients.
         * 
         * @name module:viewmodels/edit-bill-invoice#removeRecipient
         * @public
         * @function
         * @param {Object} recipient - Recipient to be removed from from the list of invoice recipients.
         */
        function removeRecipient(recipient) {
            invoiceRecipients.remove(recipient);
            recipient.entityAspect.setDeleted();
            recipient.Amount.notifySubscribers();
            refreshTenants();
        }

        /** 
         * Initialises a new invoice recipient with the entity manager using associated observable values.
         * 
         * @name module:viewmodels/edit-bill-invoice#initNewRecipient
         * @public
         * @function
         */
        function initNewRecipient() {
            newInvoiceRecipient({ User: ko.observable({ FullName: ko.observable('Select a recipient') }), BillInvoice: billInvoice(), Paid: ko.observable(false), Amount: ko.observable() });
        }

        /** 
         * Sets the user of the new invoice recipient to the specified tenant.
         * 
         * @name module:viewmodels/edit-bill-invoice#clickedCombo
         * @public
         * @function
         */
        function clickedCombo(tenant, newInvoiceRecipient) {
            newInvoiceRecipient.User(tenant);
        }

        /** 
         * Inverts the paid status of the new invoice recipient.
         * 
         * @name module:viewmodels/edit-bill-invoice#checkboxClicked
         * @public
         * @function
         * @param {Object} recip - Recipient to have paid status inverted.
         */
        function checkboxClicked(recip) {
            if (!recip.Paid()) {
                recip.Paid(true);
                logger.logSuccess(recip.User().FullName().concat(' has now paid.'), null, 'edit-bill-invoice', true);
            } else {
                recip.Paid(false);
                logger.logSuccess(recip.User().FullName().concat(' has now un-paid.'), null, 'edit-bill-invoice', true);
            }
        }
    });