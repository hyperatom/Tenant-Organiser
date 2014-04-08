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

        invoiceSaved: invoiceSaved,
        invoiceDeleted: invoiceDeleted,
        invoiceUndone: invoiceUndone,

        tenantsList: tenantsList
    };

    return vm;

    function activate(billname) {

        invoiceRecipients.removeAll();
        initTenantsList(tenantsList);
        initNewRecipient(newInvoiceRecipient);
        initInvoiceRecipients(invoiceRecipients);

        var amount = 0;
        ko.utils.arrayForEach(invoiceRecipients(), function (recip) { amount += parseInt(recip.Amount()); });
        totalAmount(amount);

        billName(billname);

        logger.log('Add Bill Invoice Activated', null, 'edit-bill-invoice', true);

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

    function invoiceSaved() {

        router.navigate('#bills');

        logger.logSuccess('Invoice Saved!', null, 'edit-bill-invoice', true);
    }

    function invoiceDeleted() {

        router.navigate('#bills');

        logger.logSuccess('Invoice Deleted!', null, 'edit-bill-invoice', true);
    }

    function invoiceUndone() {

        invoiceRecipients.removeAll();
        initInvoiceRecipients(invoiceRecipients);

        dueDate("28 March '14");

        logger.log('Changes undone!', null, 'edit-bill-invoice', true);
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

    function initInvoiceRecipients(recipients) {

        recipients.push({ GlyphClass: ko.observable('glyphicon glyphicon-unchecked'), UserFullName: ko.observable('Adam Barrell'), Amount: ko.observable('72') });
        recipients.push({ GlyphClass: ko.observable('glyphicon glyphicon-check'), UserFullName: ko.observable('Joss Whittle'), Amount: ko.observable('33') });
        recipients.push({ GlyphClass: ko.observable('glyphicon glyphicon-unchecked'), UserFullName: ko.observable('Toby Webster'), Amount: ko.observable('90') });
        recipients.push({ GlyphClass: ko.observable('glyphicon glyphicon-unchecked'), UserFullName: ko.observable('Tom Walton'), Amount: ko.observable('70') });
        recipients.push({ GlyphClass: ko.observable('glyphicon glyphicon-check'), UserFullName: ko.observable('Chris Lewis'), Amount: ko.observable('44') });

        recipients()[0].Amount.subscribe(recipientAmountChanged);
        recipients()[1].Amount.subscribe(recipientAmountChanged);
        recipients()[2].Amount.subscribe(recipientAmountChanged);
        recipients()[3].Amount.subscribe(recipientAmountChanged);
        recipients()[4].Amount.subscribe(recipientAmountChanged);

        recipients()[0].Amount.notifySubscribers();
        recipients()[1].Amount.notifySubscribers();
        recipients()[2].Amount.notifySubscribers();
        recipients()[3].Amount.notifySubscribers();
        recipients()[4].Amount.notifySubscribers();
    }
});