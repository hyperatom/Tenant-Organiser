define(['services/logger', 'plugins/router', 'services/datacontext', 'services/session'],
    function (logger, router, datacontext, session) {

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

        function activate(billTypeId) {

            return Q.all([refreshTenants(), refreshBillType(billTypeId), initNewBillInvoice(), initNewRecipient()]).then(function () {
                pageHeader("New " + billType().Name() + " Invoice");
                logger.log('Add Bill Invoice Activated', null, 'add-bill-invoice', true);
            });
        }

        function deactivate() {
            billType(null);
            totalAmount(null);
            invoiceRecipients([]);
            dueDate(null);
        }

        function refreshTenants() {
            return datacontext.getTenants(tenantsList, session.sessionUser().HouseId());
        }

        function refreshBillType(id) {
            return datacontext.getBillTypeById(billType, id);
        }

        function initNewBillInvoice() {
            return billInvoice(datacontext.createBillInvoice(billType()));
        }

        function initNewRecipient() {
            newInvoiceRecipient({ User: ko.observable({ FullName: ko.observable('Select a recipient') }), BillInvoice: billInvoice(), Paid: ko.observable(false), Amount: ko.observable() });
        }

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

        function invoiceCreated() {

            // Validate new invoice
            if (!dueDate()) {
                logger.logError("Please enter a due date for the invoice.", null, 'add-bill-invoice', true);
                return;
            }

            // Format to american style since breeze requires this
            billInvoice().DueDate(moment(dueDate(), 'DD/MM/YYYY').format('MM/DD/YYYY'));

            // Creates new bill invoice allowing us to attach navigation properites
            return datacontext.saveChanges().then(createRecipients);

            function createRecipients() {

                $.each(invoiceRecipients(), function(i, recip) {
                    var newRecip = datacontext.createInvoiceRecipient(billInvoice());
  
                    newRecip.Amount(recip.Amount());
                    newRecip.Paid(recip.Paid());
                    newRecip.User(recip.User());
                    newRecip.BillInvoice(billInvoice());
                });

                return datacontext.saveChanges().then(function() {
                    logger.logSuccess('Invoice Created!', null, 'add-bill-invoice', true);
                    return router.navigate('#bills');
                });
            }
        }

        function invoiceUndone() {

            ko.utils.arrayForEach(invoiceRecipients(), function (recip) { invoiceRecipients.removeAll(); });
            totalAmount(0);
            dueDate('');

            logger.log('Changes undone!', null, 'add-bill-invoice', true);
        }

        function recipientAmountChanged(newValue) {

            recipientAmountChanging = true;

            var total = 0;

            ko.utils.arrayForEach(invoiceRecipients(), function (recip) { console.log(total += parseInt(recip.Amount())); });

            if (totalAmountChanging == false)
                totalAmount(total);

            recipientAmountChanging = false;
        }

        function totalAmountChanged(target, oldValue, newValue) {

            var size = invoiceRecipients().length;

            if (oldValue != newValue && newValue != "" && size > 0 && recipientAmountChanging == false) {
                var sharedAmount = newValue / size;

                totalAmountChanging = true;
                ko.utils.arrayForEach(invoiceRecipients(), function (recip) { recip.Amount(sharedAmount) });
                totalAmountChanging = false;
            }
        }

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

            initNewRecipient();
        }

        function removeRecipient(recipient) {

            invoiceRecipients.remove(recipient);
            recipient.Amount.notifySubscribers();
        }

        function clickedCombo(tenant, newInvoiceRecipient) {
            newInvoiceRecipient.User(tenant);
        }

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