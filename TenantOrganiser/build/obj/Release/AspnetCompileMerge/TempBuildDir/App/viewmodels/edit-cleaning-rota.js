define(['services/logger'], function (logger) {

    var communalAreas = new ko.observableArray();
    var tenantGroups = new ko.observableArray();
    var rotaGroups = new ko.observableArray();

    var startDate = new ko.observable("26 March '14");

    var rotaOccurance = new ko.observable('Weekly');
    var occuranceOptions = new ko.observableArray();

    var newCommunalArea = new ko.observable();

    var vm = {
        activate: activate,
        title: 'Edit Cleaning Rota',
        attached: viewAttached,

        tenantGroups: tenantGroups,
        rotaGroups: rotaGroups,

        startDate: startDate,

        communalAreas: communalAreas,
        newCommunalArea: newCommunalArea,

        occuranceOptions: occuranceOptions,

        addAreaClicked: addAreaClicked,
        removeAreaClicked: removeAreaClicked,

        saveAreasClicked: saveAreasClicked,
        undoAreasClicked: undoAreasClicked,

        saveSettingsClicked: saveSettingsClicked,
        undoSettingsClicked: undoSettingsClicked,

        groupOptionClicked: groupOptionClicked,
        rotaOccurance: rotaOccurance,
        occuranceOptionClicked: occuranceOptionClicked
    };

    return vm;


    function activate() {

        communalAreas(initCommunalAreas().slice());
        tenantGroups(initTenantGroups().slice());
        rotaGroups(getRotaGroupNames().slice());
        occuranceOptions(initOccuranceOptions().slice());

        logger.log('Edit Cleaning Rota View Activated', null, 'edit-cleaning-rota', true);

        return true;
    }

    function viewAttached() {

        $(".input-group.date").datepicker({ autoclose: true, todayHighlight: true });
    }

    function saveSettingsClicked() {

        logger.logSuccess('Settings Saved!', null, 'edit-cleaning-rota', true);
    }

    function undoSettingsClicked() {

        startDate("26 March '14");
        rotaOccurance('Weekly');

        logger.log('Settings Reset!', null, 'edit-cleaning-rota', true);
    }

    function occuranceOptionClicked(occuranceSelected, data, event) {

        rotaOccurance(occuranceSelected);
    }

    function initOccuranceOptions() {

        var options = new ko.observableArray();

        options.push({ OptionName: "Weekly" });
        options.push({ OptionName: "Fortnightly" });
        options.push({ OptionName: "Monthly" });

        return options;
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

    function saveAreasClicked() {

        logger.logSuccess('Communal Areas Saved!', null, 'edit-cleaning-rota', true);
    }

    function undoAreasClicked() {

        communalAreas(initCommunalAreas().slice());
        logger.log('Communal Areas Reset!', null, 'edit-cleaning-rota', true);
    }

    function initCommunalAreas() {

        var areas = new ko.observableArray();

        areas.push({ Name: "Kitchen" });
        areas.push({ Name: "Bathroom" });
        areas.push({ Name: "Floors" });
        areas.push({ Name: "Living Room" });

        return areas;
    }

    function addAreaClicked(data) {

        communalAreas.push({ Name: newCommunalArea() });
        newCommunalArea('');
    }

    function removeAreaClicked(data) {

        communalAreas.remove(data);
    }


});