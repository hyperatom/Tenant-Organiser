define(['services/logger', 'plugins/router', 'services/datacontext', 'services/session'],
    function (logger, router, datacontext, session) {

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

        function activate(invoiceId) {

            return Q.all([refreshTenants(), refreshInvoice(invoiceId), refreshBillType()]).then(function () {
                pageHeader("Edit " + billType().Name() + " Invoice");
                invoiceRecipients(billInvoice().Recipients().slice());
                removeRecipsFromTenantsList();

                initNewRecipient();

                var amount = 0;

                ko.utils.arrayForEach(invoiceRecipients(), function (recip) {
                    recip.Amount.subscribe(recipientAmountChanged);
                    amount += recip.Amount();
                });

                totalAmount(amount.toFixed(2));

                dueDate(moment(billInvoice().DueDate()).format('DD/MM/YYYY'));

                logger.log('Add Bill Invoice Activated', null, 'edit-bill-invoice', true);
            });
        }

        function removeRecipsFromTenantsList() {

            return refreshTenants().then(function () {
                // Remove all tenants who are already recipients of convo
                tenantsList(tenantsList().filter(filterTenants));
            });

            function filterTenants(tenant) {
                var results = $.grep(invoiceRecipients(), isTenantRecipient);

                function isTenantRecipient(invoiceRecip) {
                    return invoiceRecip.UserId() === tenant.Id();
                }

                // If user is not in the active convo, include them in tenants list
                return results.length === 0;
            }
        }

        function refreshTenants() {
            return datacontext.getTenants(tenantsList, session.sessionUser().HouseId());
        }

        function refreshInvoice(id) {
            return datacontext.getInvoiceById(billInvoice, id);
        }

        function refreshBillType() {
            return billType(billInvoice().BillType());
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

        function invoiceSaved() {
            datacontext.saveChanges().then(saveSuccess);

            function saveSuccess() {
                router.navigate('#bills');
                logger.logSuccess('Invoice Saved!', null, 'edit-bill-invoice', true);
            }
        }

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

        function invoiceUndone() {

            invoiceRecipients([]);
            datacontext.rejectChanges();
            invoiceRecipients(billInvoice().Recipients().slice());
            removeRecipsFromTenantsList();

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

        function recipientAmountChanged(newValue) {

            recipientAmountChanging = true;

            var total = 0;

            ko.utils.arrayForEach(invoiceRecipients(), function (recip) { total += recip.Amount(); });

            if (totalAmountChanging == false)
                totalAmount(total.toFixed(2));

            recipientAmountChanging = false;
        }

        function totalAmountChanged(target, oldValue, newValue) {

            var size = invoiceRecipients().length;

            if (oldValue != newValue && newValue != "" && size > 0 && recipientAmountChanging == false) {
                var sharedAmount = newValue / size;

                totalAmountChanging = true;
                ko.utils.arrayForEach(invoiceRecipients(), function (recip) { recip.Amount(sharedAmount.toFixed(2)) });
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

            removeRecipsFromTenantsList();

            initNewRecipient();
        }

        function removeRecipient(recipient) {

            invoiceRecipients.remove(recipient);
            recipient.entityAspect.setDeleted();
            //billInvoice().Recipients.remove(recipient);
            recipient.Amount.notifySubscribers();

            removeRecipsFromTenantsList();
        }

        function initNewRecipient() {
            newInvoiceRecipient({ User: ko.observable({ FullName: ko.observable('Select a recipient') }), BillInvoice: billInvoice(), Paid: ko.observable(false), Amount: ko.observable() });
        }

        function clickedCombo(tenant, newInvoiceRecipient) {
            newInvoiceRecipient.User(tenant);
        }

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