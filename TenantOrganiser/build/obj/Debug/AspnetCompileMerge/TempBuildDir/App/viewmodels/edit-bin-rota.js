define(['services/logger'], function (logger) {

    var tenantGroups = new ko.observableArray();
    var rotaGroups = new ko.observableArray();

    var binColourOptions = new ko.observableArray();

    var binTypes = new ko.observableArray();
    var newBinType = new ko.observable();

    var occuranceOptions = new ko.observableArray();

    var vm = {
        activate: activate,
        title: 'Edit Bin Rota',
        attached: viewAttached,

        tenantGroups: tenantGroups,
        rotaGroups: rotaGroups,

        binColourOptions: binColourOptions,
        binColourOptionsClicked: binColourOptionsClicked,

        occuranceOptions: occuranceOptions,

        binTypes: binTypes,
        newBinType: newBinType,

        groupOptionClicked: groupOptionClicked,
        occuranceOptionsClicked: occuranceOptionsClicked,

        deleteBinTypeClicked: deleteBinTypeClicked,
        addBinTypeClicked: addBinTypeClicked,
        saveBinTypesClicked: saveBinTypesClicked,
        undoBinTypesClicked: undoBinTypesClicked
    };

    return vm;


    function activate() {

        tenantGroups(initTenantGroups().slice());
        rotaGroups(getRotaGroupNames().slice());
        binTypes(initBinTypes().slice());

        binColourOptions(initBinColourOptions().slice());

        newBinType(initNewBinType());

        occuranceOptions(initOccuranceOptions());

        logger.log('Edit Bin Rota View Activated', null, 'edit-bin-rota', true);

        return true;
    }

    function viewAttached() {

        $(".input-group.date").datepicker({ autoclose: true, todayHighlight: true });
    }

    function binColourOptionsClicked(binType, colourClicked, data, event) {

        binType.Colour(colourClicked);
    }

    function initBinColourOptions() {

        var options = new ko.observableArray();

        options.push({ Name: 'black' });
        options.push({ Name: 'red' });
        options.push({ Name: 'green' });
        options.push({ Name: 'pink' });
        options.push({ Name: 'brown' });

        return options;
    }

    function saveBinTypesClicked() {

        logger.logSuccess('Bin Types Saved!', null, 'edit-bin-rota', true);
    }

    function undoBinTypesClicked() {

        binTypes(initBinTypes().slice());
        viewAttached();

        logger.log('Bin Types Reset!', null, 'edit-bin-rota', true);
    }

    function occuranceOptionsClicked(binTypeRow, occuranceSelected, data, event) {

        console.log(binTypeRow);
        binTypeRow.Occurance(occuranceSelected);
    }

    function deleteBinTypeClicked(data, event) {

        binTypes.remove(data);
    }

    function addBinTypeClicked(data) {

        binTypes.push(newBinType());

        newBinType(initNewBinType());

        // Rebind view attachment events
        viewAttached();
    }

    function initOccuranceOptions() {

        var options = new ko.observableArray();

        options.push({ Name: 'Weekly' });
        options.push({ Name: 'Fortnightly' });
        options.push({ Name: 'Monthly' });

        return options;
    }

    function initNewBinType() {

        return data = 
            {
                Name: ko.observable(''),
                Occurance: ko.observable('Weekly'),
                StartDate: ko.observable(""),
                Colour: ko.observable('black')
            };
    }

    function initBinTypes() {

        var types = new ko.observableArray();

        types.push({ Name: ko.observable('Black & Pink'), Occurance: ko.observable('Weekly'), StartDate: ko.observable("23 September '13"), Colour: ko.observable('pink') });
        types.push({ Name: ko.observable('Green'), Occurance: ko.observable('Weekly'), StartDate: ko.observable("1 October '13"), Colour: ko.observable('green') });

        return types;
    }

    function groupOptionClicked(tenantRow, groupSelected, data, event) {

        tenantRow.Group(groupSelected);

        logger.logSuccess('Group Change Saved!', null, 'edit-cleaning-rota', true);
    }

    function getRotaGroupNames() {

        var groups = new ko.observableArray();

        groups.push({ Name: 'Group 1' });
        groups.push({ Name: 'Group 2' });
        groups.push({ Name: 'Group 3' });
        groups.push({ Name: 'Group 4' });
        groups.push({ Name: 'Group 5' });
        groups.push({ Name: 'Group 6' });

        return groups;
    }

    function getRandomRotaGroupName() {

        var groups = getRotaGroupNames();
        var randIndex = Math.floor((Math.random() * groups().length));

        return groups()[randIndex].Name;
    }

    function initTenantGroups() {

        var groups = new ko.observableArray();

        groups.push({ TenantName: 'Adam Barrell', Group: ko.observable(getRandomRotaGroupName()) });
        groups.push({ TenantName: 'Tom Walton', Group: ko.observable(getRandomRotaGroupName()) });
        groups.push({ TenantName: 'Chris Lewis', Group: ko.observable(getRandomRotaGroupName()) });
        groups.push({ TenantName: 'Tom Milner', Group: ko.observable(getRandomRotaGroupName()) });
        groups.push({ TenantName: 'Toby Webster', Group: ko.observable(getRandomRotaGroupName()) });
        groups.push({ TenantName: 'Joss Whittle', Group: ko.observable(getRandomRotaGroupName()) });

        return groups;
    }

});