define(['services/logger'], function (logger) {

    var cleaningRota = new ko.observableArray();
    var binCollectionRota = new ko.observableArray();

    var currentCleaningRotaIndex = new ko.observable(0);
    var binCollectionIndex = new ko.observable(0);

    var viewInitialised = false;

    var vm = {
        activate: activate,
        title: 'Tasks',

        cleaningRota: cleaningRota,
        binCollectionRota: binCollectionRota,

        currentCleaningRotaIndex: currentCleaningRotaIndex,
        binCollectionIndex : binCollectionIndex,

        isPreviousCleanNavEnabled: isPreviousCleanNavEnabled,
        isNextCleanNavEnabled: isNextCleanNavEnabled,

        isPreviousBinNavEnabled: isPreviousBinNavEnabled,
        isNextBinNavEnabled: isNextBinNavEnabled,

        navPreviousCleaningRota: navPreviousCleaningRota,
        navNextCleaningRota: navNextCleaningRota,

        navPreviousBinRota: navPreviousBinRota,
        navNextBinRota: navNextBinRota,

        cleanStatusClicked: cleanStatusClicked
    };

    return vm;


    function activate() {

        if (viewInitialised == false) {

            console.log('Getting cleaning rota data...');

            // Slice copies all elements of the returning function
            cleaningRota(getCleaningRotaData().slice());
            binCollectionRota(getBinCollectionRotaData().slice());

            //console.log('Retrieved bin rota data...');

            viewInitialised = true;
        }

        logger.log('Tasks View Activated', null, 'tasks', true);

        return true;
    }

    function getBinCollectionRotaData() {

        var rota = new ko.observableArray();

        rota.push({ DueDate: "12th September '13", ShortDate: '12th September', Colour: 'Green', Name: 'Green Bins', Tenants: getRandomTenantsGroup() });
        rota.push({ DueDate: "30th October '13", ShortDate: '30th October', Colour: 'Pink', Name: 'Black & Pink Bins', Tenants: getRandomTenantsGroup() });
        rota.push({ DueDate: "2nd December '13", ShortDate: '2nd December', Colour: 'Brown', Name: 'Brown Bins', Tenants: getRandomTenantsGroup() });

        return rota;
    }


    function navNextBinRota() {

        binCollectionIndex(binCollectionIndex() + 1);
    }

    function navPreviousBinRota() {

        binCollectionIndex(binCollectionIndex() - 1);
    }

    function cleanStatusClicked(data) {

        data.Completed(!data.Completed());

        if (data.Completed())
            logger.logSuccess(data.Tenants + " Cleaned!", null, 'tasks', true);
        else
            logger.logSuccess(data.Tenants + " Un-Cleaned!", null, 'tasks', true);
    }

    function navNextCleaningRota() {

        currentCleaningRotaIndex(currentCleaningRotaIndex() + 1);
    }

    function navPreviousCleaningRota() {

        currentCleaningRotaIndex(currentCleaningRotaIndex() - 1);
    }

    function isPreviousBinNavEnabled() {

        if ((binCollectionRota().length > 1) && binCollectionIndex() > 0)
            return true;
        else
            return false;
    }

    function isNextBinNavEnabled() {

        if (binCollectionIndex() < (binCollectionRota().length - 1))
            return true
        else
            return false;
    }

    function isPreviousCleanNavEnabled() {

        if ((cleaningRota().length > 1) && currentCleaningRotaIndex() > 0)
            return true;
        else
            return false;
    }

    function isNextCleanNavEnabled() {

        if (currentCleaningRotaIndex() < (cleaningRota().length - 1))
            return true
        else
            return false;
    }

    function getCleaningRotaData() {

        var rota = new ko.observableArray();

        rota.push({ DueDate: "15th September '13", RotaData: getRandomCleaningData() });
        rota.push({ DueDate: "20th September '13", RotaData: getRandomCleaningData() });
        rota.push({ DueDate: "2nd October '13", RotaData: getRandomCleaningData() });

        return rota;
    }

    function getRandomCleaningData() {

        var data = new ko.observableArray();

        data.push({ Completed: getRandomTruth(), Area: 'Kitchen', Tenants: getRandomTenantsGroup() });
        data.push({ Completed: getRandomTruth(), Area: 'Bathroom', Tenants: getRandomTenantsGroup() });
        data.push({ Completed: getRandomTruth(), Area: 'Floors', Tenants: getRandomTenantsGroup() });
        data.push({ Completed: getRandomTruth(), Area: 'Living Room', Tenants: getRandomTenantsGroup() });

        return data;
    }

    function getRandomTruth() {

        return new ko.observable(Math.random() < 0.5 ? true : false);
    }

    function getRandomTenantsGroup() {

        var tenants = new ko.observableArray();

        tenants.push({ TenantNames: 'Adam Barrell' });
        tenants.push({ TenantNames: 'Joss Whittle / Toby Webster' });
        tenants.push({ TenantNames: 'Tom Walton / Tom Milner' });
        tenants.push({ TenantNames: 'Chris Lewis' });

        var randomIndex = Math.floor((Math.random() * 3) + 0);

        return tenants()[randomIndex].TenantNames;
    }

});