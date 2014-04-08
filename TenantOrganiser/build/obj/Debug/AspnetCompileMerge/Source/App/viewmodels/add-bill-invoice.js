define(['services/logger', 'plugins/router'], function (logger, router) {

    var initialised = false;

    var invoiceRecipients = new ko.observableArray();
    var newInvoiceRecipient = new ko.observableArray();
    var tenantsList = new ko.observableArray();

    var billName = new ko.observable('');

    var totalAmount = new ko.observable(0);
    var dueDate = new ko.observable("26 March '14");

    var recipientAmountChanging = false;
    var totalAmountChanging = false;

    var vm = {
        activate: activate,
        title: 'Add Bill Invoice View',
        attached: viewAttached,

        billName: billName,

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

        tenantsList: tenantsList
    };

    return vm;

    function activate(context) {

        if (initialised == false) {

            initTenantsList(tenantsList);
            initNewRecipient(newInvoiceRecipient);

            initialised = true;
        } else {
            invoiceRecipients.removeAll();
            dueDate('');
            totalAmount('');
        }

        billName(context.billname);

        logger.log('Add Bill Invoice Activated', null, 'add-bill-invoice', true);

        return true;
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

        router.navigate('#bills');

        logger.logSuccess('Invoice Created!', null, 'add-bill-invoice', true);
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

            console.log('yes');

            totalAmountChanging = true;
            ko.utils.arrayForEach(invoiceRecipients(), function (recip) { recip.Amount(sharedAmount) });
            totalAmountChanging = false;
        }
    }

    function addNewRecipient() {

        var recip = { GlyphClass: ko.observable(newInvoiceRecipient().GlyphClass()), UserFullName: ko.observable(newInvoiceRecipient().UserFullName()), Amount: ko.observable(newInvoiceRecipient().Amount()) };

        recip.Amount.subscribe(recipientAmountChanged);

        invoiceRecipients.push(recip);

        recip.Amount.notifySubscribers();

        newInvoiceRecipient().GlyphClass('glyphicon glyphicon-unchecked');
        newInvoiceRecipient().UserFullName('Select a recipient');
        newInvoiceRecipient().Amount('');
    }

    function removeRecipient(recipient) {

        invoiceRecipients.remove(recipient);
        recipient.Amount.notifySubscribers();
    }

    function initTenantsList(list) {

        list.push({ UserFullName: 'Adam Barrell' });
        list.push({ UserFullName: 'Joss Whittle' });
        list.push({ UserFullName: 'Tom Milner' });
        list.push({ UserFullName: 'Toby Webster' });
    }

    function initNewRecipient(observableRecipient) {

        observableRecipient({ GlyphClass: ko.observable('glyphicon glyphicon-unchecked'), UserFullName: ko.observable('Select a recipient'), Amount: ko.observable('') });
    }

    function clickedCombo(clicked, buttonLabel, event) {

        console.log(clicked);

        buttonLabel.UserFullName(clicked);
    }

    function checkboxClicked(data) {

        console.log(data);

        if (data.GlyphClass() == "glyphicon glyphicon-unchecked") {

            data.GlyphClass("glyphicon glyphicon-check");
            logger.logSuccess(data.UserFullName().concat(' has now paid.'), null, 'bills', true);

        } else if (data.GlyphClass() == "glyphicon glyphicon-check") {

            data.GlyphClass("glyphicon glyphicon-unchecked");
            logger.logSuccess(data.UserFullName().concat(' has now un-paid.'), null, 'bills', true);
        }
    }
});