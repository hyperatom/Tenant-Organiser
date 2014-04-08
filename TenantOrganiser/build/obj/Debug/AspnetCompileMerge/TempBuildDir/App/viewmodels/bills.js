define(['services/logger', 'plugins/router'], function (logger, router) {

    var bills = new ko.observableArray();
    var billMarkedForDelete = null;

    var newBillType = new ko.observableArray();
    var tenantsList = new ko.observableArray();

    var initialised = false;

    var vm = {
        activate: activate,
        title: 'Bills View',
        bills: bills,

        newBillType: newBillType,
        tenantsList: tenantsList,

        navPreviousInvoice: navPreviousInvoice,
        navNextInvoice: navNextInvoice,
        isPreviousEnabled: isPreviousEnabled,
        isNextEnabled: isNextEnabled,

        checkboxClicked: checkboxClicked,
        clickedCombo: clickedCombo,

        createdBillType: createdBillType,

        markBillForDelete: markBillForDelete,
        deleteBill: deleteBill,

        navToAddInvoice: navToAddInvoice,
        navToEditInvoice: navToEditInvoice
    };

    return vm;

    function activate() {

        if (initialised == false) {
            getBills(bills);
            initTenantsList(tenantsList);
            initNewBillType(newBillType);
            initialised = true;
        }

        logger.log('Bills View Activated', null, 'bills', true);

        return true;
    }

    function createdBillType(bill) {
        console.log(bill);
        bills.push(bill);
    }

    function markBillForDelete(data) {

        billMarkedForDelete = data;
    }

    function deleteBill() {

        var billName = billMarkedForDelete.Name;

        bills.remove(billMarkedForDelete);
        billMarkedForDelete = null;

        logger.logSuccess(billName.concat(' bill has been deleted.'), null, 'bills', true);
    }

    function navToEditInvoice(bill) {

        router.navigate('/#edit-bill-invoice/' + bill.Name());
    }

    function navToAddInvoice(bill) {

        router.navigate('/#add-bill-invoice/' + bill.Name());
    }

    function checkboxClicked(data) {

        if (data.GlyphClass() == "glyphicon glyphicon-unchecked") {

            data.GlyphClass("glyphicon glyphicon-check");
            logger.logSuccess(data.UserFullName.concat(' has now paid.'), null, 'bills', true);

        } else if (data.GlyphClass() == "glyphicon glyphicon-check") {

            data.GlyphClass("glyphicon glyphicon-unchecked");
            logger.logSuccess(data.UserFullName.concat(' has now un-paid.'), null, 'bills', true);
        }
    }

    function navPreviousInvoice(data) {

        data.InvoiceIndex(data.InvoiceIndex()-1);
    }

    function navNextInvoice(data) {

        data.InvoiceIndex(data.InvoiceIndex()+1);
    }


    function isPreviousEnabled(index, numInvoices) {

        if (numInvoices <= 0 || index <= 0)
            return false;
        else
            return true;
    }

    function isNextEnabled(index, numInvoices) {

        if (numInvoices <= 0 || index + 1 >= numInvoices)
            return false;

        return true;
    }

    function getBills(observableBills) {

        observableBills.push({ ProfilePicture: '../Content/images/profile-picture.jpg', Manager: 'Adam', Name: ko.observable('Gas & Electric'), Invoices: getInvoices(), InvoiceIndex: ko.observable(0) });
        observableBills.push({ ProfilePicture: '../Content/images/profile-picture-2.jpg', Manager: 'Chris', Name: ko.observable('Water'), Invoices: getInvoices(), InvoiceIndex: ko.observable(0) });
        observableBills.push({ ProfilePicture: '../Content/images/profile-picture-3.jpg', Manager: 'Joss', Name: ko.observable('Internet'), Invoices: getInvoices(), InvoiceIndex: ko.observable(0) });
    }

    function getInvoices() {
        
        var observableInvoices = ko.observableArray();

        observableInvoices.push({ DueDate: '15th September', Recipients: getInvoiceRecipients() });
        observableInvoices.push({ DueDate: '20th September', Recipients: getInvoiceRecipients() });
        observableInvoices.push({ DueDate: '8th October', Recipients: getInvoiceRecipients() });

        return observableInvoices;
    }

    function getInvoiceRecipients() {

        var observableInvoiceRecipients = ko.observableArray();

        observableInvoiceRecipients.push({ GlyphClass: ko.observable('glyphicon glyphicon-unchecked'), UserFullName: 'Adam Barrell', Amount: '£'.concat(Math.floor((Math.random() * 100) + 9)) });
        observableInvoiceRecipients.push({ GlyphClass: ko.observable('glyphicon glyphicon-check'), UserFullName: 'Joss Whittle', Amount: '£'.concat(Math.floor((Math.random() * 100) + 9)) });
        observableInvoiceRecipients.push({ GlyphClass: ko.observable('glyphicon glyphicon-unchecked'), UserFullName: 'Toby Webster', Amount: '£'.concat(Math.floor((Math.random() * 100) + 9)) });
        observableInvoiceRecipients.push({ GlyphClass: ko.observable('glyphicon glyphicon-unchecked'), UserFullName: 'Tom Walton', Amount: '£'.concat(Math.floor((Math.random() * 100) + 9)) });
        observableInvoiceRecipients.push({ GlyphClass: ko.observable('glyphicon glyphicon-check'), UserFullName: 'Chris Lewis', Amount: '£'.concat(Math.floor((Math.random() * 100) + 9)) });

        return observableInvoiceRecipients;
    }

    function clickedCombo(clicked, buttonLabel, event) {

        buttonLabel.Manager(clicked);
    }

    function initTenantsList(list) {

        list.push({ UserFullName: 'Adam Barrell' });
        list.push({ UserFullName: 'Joss Whittle' });
        list.push({ UserFullName: 'Tom Milner' });
        list.push({ UserFullName: 'Toby Webster' });
    }

    function initNewBillType(observableBill) {

        observableBill({ ProfilePicture: '../Content/images/profile-picture.jpg', Manager: ko.observable('Select a Manager'), Name: ko.observable(''), Invoices: ko.observableArray(), InvoiceIndex: ko.observable(0) });
    }

});