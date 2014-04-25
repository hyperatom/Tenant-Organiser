/**
 * View model for the Bills view. 
 * Performs tasks associated with bill management.
 * 
 * @module viewmodels/bills
 */
define(['services/logger', 'durandal/app', 'plugins/router', 'services/datacontext', 'services/session', 'services/model', './create-bill-modal'],

    function (logger, app, router, datacontext, session, model, CustomModal) {

        var bills = new ko.observableArray();

        var newBillType = new ko.observableArray();
        var tenantsList = new ko.observableArray();

        var initialised = false;

        var vm = {
            activate: activate,
            title: 'Bills View',
            bills: bills,
            addBill: addBill,

            newBillType: newBillType,
            tenantsList: tenantsList,

            navPreviousInvoice: navPreviousInvoice,
            navNextInvoice: navNextInvoice,
            isPreviousEnabled: isPreviousEnabled,
            isNextEnabled: isNextEnabled,

            checkboxClicked: checkboxClicked,

            deleteBill: deleteBill,

            navToAddInvoice: navToAddInvoice,
            navToEditInvoice: navToEditInvoice
        };

        return vm;

        /** 
         * Activates the view model by initialising required data.
         * 
         * @name module:viewmodels/bills#activate
         * @public
         * @function
         * @returns {Object} A promise returned when all asynchronous queries have completed. 
         */
        function activate() {
            return Q.all([refreshBills(), refreshTenants()]).then(function () {
                logger.log('Bills View Activated', null, 'bills', true);
            });
        }

        /** 
         * Refreshes the latest bills associated with the session user's house.
         * 
         * @name module:viewmodels/bills#refreshBills
         * @public
         * @function
         * @returns {Object} A promise returned the bills have been retrieved.
         */
        function refreshBills() {
            return datacontext.getBillTypesByHouse(bills, session.sessionUser().HouseId()).then(function () {

                // Ensures that the associated invoices are ordered by date
                $.each(bills(), function (i, bill) {
                    bill.BillInvoices().sort(function (left, right) {
                        return left.DueDate() < right.DueDate() ? -1 : 1;
                    });

                    // Makes sure the current invoice is up to date when user has returned from creating invoice
                    bill.currentInvoice(model.getNextBill(bill));
                });
            });
        }

        /** 
         * Refreshes the list of tenants associated with the session user's house.
         * 
         * @name module:viewmodels/bills#refreshTenants
         * @public
         * @function
         * @returns {Object} A promise returned the users have been retrieved.
         */
        function refreshTenants() {
            return datacontext.getUsersByHouse(tenantsList, session.sessionUser().HouseId());
        }

        /** 
         * Adds the created bill type to the observable array of bills.
         * 
         * @name module:viewmodels/bills#createdBillType
         * @public
         * @function
         * @param {Object} Bill type to be added to the observable array of bills.
         */
        function createdBillType(bill) {
            bills.push(bill);
        }

        /** 
         * Displays a modal used to create a new bill type.
         * Refreshes the list of bills if creation was successful.
         * 
         * @name module:viewmodels/bills#addBill
         * @public
         * @function
         */
        function addBill() {
            CustomModal.show().then(function (result) {
                return result ? refreshBills() : null;
            });
        }

        /** 
         * Displays a modal requiring the user to confirm deletion of the specified bill type.
         * 
         * @name module:viewmodels/bills#deleteBill
         * @public
         * @function
         * @param {Object} bill - Bill selected for deletion.
         * @returns {Object} Promise returned when changes have been saved.
         */
        function deleteBill(bill) {

            return app.showMessage(
                'Are you sure you want to delete this bill and all of its invoices?',
                'Delete ' + bill.Name(),
                ['Yes', 'No']).then(processResponse);

            function processResponse(response) {
                if (response === 'Yes') {
                    var billEntity = bill;
                    bills.remove(bill);
                    billEntity.entityAspect.setDeleted();
                    return datacontext.saveChanges().then(function () {
                        logger.logSuccess(billEntity.Name().concat(' bill has been deleted.'), null, 'bills', true);
                    });
                }
            }
        }

        /** 
         * Redirects the browser to the edit page for the current invoice being viewed.
         * 
         * @name module:viewmodels/bills#navToEditInvoice
         * @public
         * @function
         * @param {Object} bill - Bill to be used to navigate to its currently viewed invoice.
         */
        function navToEditInvoice(bill) {
            router.navigate('#edit-bill-invoice/' + bill.currentInvoice().Id());
        }

        /** 
         * Redirects the browser to the add page for the specified bill type.
         * 
         * @name module:viewmodels/bills#navToAddInvoice
         * @public
         * @function
         * @param {Object} bill - Bill to be used to navigate to its add invoice page.
         */
        function navToAddInvoice(bill) {
            router.navigate('#add-bill-invoice/' + bill.Id());
        }

        /** 
         * Inverses the paid status of a recipients invoice.
         * 
         * @name module:viewmodels/bills#checkboxClicked
         * @public
         * @function
         * @param {Object} recipient - Recipient to have their paid status inverted.
         */
        function checkboxClicked(recipient) {
            if (!recipient.Paid()) {
                recipient.Paid(true)
                return datacontext.saveChanges().then(function () {
                    logger.logSuccess(recipient.User().FullName().concat(' has now paid.'), null, 'bills', true);
                });
            } else {
                recipient.Paid(false)
                return datacontext.saveChanges().then(function () {
                    logger.logSuccess(recipient.User().FullName().concat(' has now un-paid.'), null, 'bills', true);
                });
            }
        }

        /** 
         * Navigates the invoice view to the previous one in relation to the
         * invoice being viewed.
         * 
         * @name module:viewmodels/bills#navPreviousInvoice
         * @public
         * @function
         * @param {Object} invoice - Invoice used to calculate the previous invoice to be displayed.
         */
        function navPreviousInvoice(invoice) {
            // Get index of currently viewed invoice from main invoices array
            var index = invoice.BillInvoices().indexOf(invoice.currentInvoice());
            invoice.currentInvoice(invoice.BillInvoices()[index - 1]);
        }

        /** 
         * Navigates the invoice view to the next one in relation to the
         * invoice being viewed.
         * 
         * @name module:viewmodels/bills#navNextInvoice
         * @public
         * @function
         * @param {Object} invoice - Invoice used to calculate the next invoice to be displayed.
         */
        function navNextInvoice(invoice) {
            // Get index of currently viewed invoice from main invoices array
            var index = invoice.BillInvoices().indexOf(invoice.currentInvoice());
            invoice.currentInvoice(invoice.BillInvoices()[index + 1]);
        }

        /** 
         * Tests whether there is a previous invoice that can be navigated to.
         * 
         * @name module:viewmodels/bills#isPreviousEnabled
         * @public
         * @function
         * @param {Object} billType - Bill type to be tested for previous invoices.
         */
        function isPreviousEnabled(billType) {
            if (billType.BillInvoices().indexOf(billType.currentInvoice()) === 0)
                return false;

            return true;
        }

        /** 
         * Tests whether there is a future invoice that can be navigated to.
         * 
         * @name module:viewmodels/bills#isNextEnabled
         * @public
         * @function
         * @param {Object} billType - Bill type to be tested for future invoices.
         */
        function isNextEnabled(billType) {
            if (billType.BillInvoices().indexOf(billType.currentInvoice()) === (billType.BillInvoices().length - 1))
                return false;

            return true;
        }
    });