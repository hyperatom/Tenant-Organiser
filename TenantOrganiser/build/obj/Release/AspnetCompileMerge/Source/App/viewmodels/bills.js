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

        function activate() {
            return Q.all([refreshBills(), refreshTenants()]).then(function () {
                logger.log('Bills View Activated', null, 'bills', true);
            });
        }

        function refreshBills() {
            return datacontext.getBillTypesByHouse(bills, session.sessionUser().HouseId()).then(function () {

                $.each(bills(), function (i, bill) {
                    bill.BillInvoices().sort(function (left, right) {
                        return left.DueDate() < right.DueDate() ? -1 : 1;
                    });

                    // Makes sure the current invoice is up to date when user has returned from creating invoice
                    bill.currentInvoice(model.getNextBill(bill));
                });
            });
        }

        function refreshTenants() {
            return datacontext.getTenants(tenantsList, session.sessionUser().HouseId());
        }

        function createdBillType(bill) {
            console.log(bill);
            bills.push(bill);
        }

        function addBill() {
            CustomModal.show().then(function (result) {
                if (result) {
                    console.log(result);
                    return refreshBills();
                }
            });
        }

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

        function navToEditInvoice(bill) {

            router.navigate('#edit-bill-invoice/' + bill.currentInvoice().Id());
        }

        function navToAddInvoice(bill) {

            router.navigate('#add-bill-invoice/' + bill.Id());
        }

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

        function navPreviousInvoice(invoice) {
            // Get index of currently viewed invoice from main invoices array
            var index = invoice.BillInvoices().indexOf(invoice.currentInvoice());
            invoice.currentInvoice(invoice.BillInvoices()[index - 1]);
        }

        function navNextInvoice(invoice) {
            // Get index of currently viewed invoice from main invoices array
            var index = invoice.BillInvoices().indexOf(invoice.currentInvoice());
            invoice.currentInvoice(invoice.BillInvoices()[index + 1]);
        }


        function isPreviousEnabled(billType) {

            if (billType.BillInvoices().indexOf(billType.currentInvoice()) === 0)
                return false;

            return true;
        }

        function isNextEnabled(billType) {
            if (billType.BillInvoices().indexOf(billType.currentInvoice()) === (billType.BillInvoices().length - 1))
                return false;

            return true;
        }

        function clickedCombo(clicked, buttonLabel, event) {

            buttonLabel.Manager(clicked);
        }

    });