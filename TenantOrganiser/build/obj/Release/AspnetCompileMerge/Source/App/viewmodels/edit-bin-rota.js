define(['services/logger', 'services/datacontext', 'services/session'],
    function (logger, datacontext, session) {

        var tenants = new ko.observableArray();
        var rotaGroups = new ko.observableArray();
        var binColourOptions = new ko.observableArray();

        var binTypes = new ko.observableArray();
        var newBinType = new ko.observable();

        var occuranceOptions = new ko.observableArray();

        var vm = {
            activate: activate,
            title: 'Edit Bin Rota',
            attached: viewAttached,
            hasChanges: datacontext.hasChanges,

            tenants: tenants,
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

            return Q.all([refreshTenants(), refreshBinRotas()]).then(function () {
                rotaGroups(getRotaGroupNames().slice());
                binColourOptions(initBinColourOptions().slice());
                newBinType(initNewBinType());
                occuranceOptions(initOccuranceOptions().slice());

                logger.log('Edit Bin Rota View Activated', null, 'edit-bin-rota', true);
            });
        }

        function refreshTenants() {
            return datacontext.getTenants(tenants, session.sessionUser().HouseId());
        }

        function refreshBinRotas() {
            return datacontext.getBinRotasByHouse(binTypes, session.sessionUser().HouseId());
        }

        function viewAttached() {
            $(".input-group.date").datepicker({ autoclose: true, todayHighlight: true });
        }

        function binColourOptionsClicked(selectedColour, binRota) {

            binRota.Colour(selectedColour.Name);
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
            return datacontext.saveChanges().then(function () {
                logger.logSuccess('Bin Types Saved!', null, 'edit-bin-rota', true);
            });
        }

        function undoBinTypesClicked() {
            datacontext.rejectChanges();
            refreshBinRotas();
            viewAttached();
            logger.log('Bin Types Reset!', null, 'edit-bin-rota', true);

        }

        function occuranceOptionsClicked(selectedOccurance, binRota) {

            binRota.Occurance(selectedOccurance.Name);
        }

        function deleteBinTypeClicked(data) {
            data.entityAspect.setDeleted();
            binTypes.remove(data);
        }

        function addBinTypeClicked(data) {

            if (!newBinType().Name()) {
                logger.logError('A bin name is required.', null, 'edit-bin-rota', true);
                return 
            }

            if (!newBinType().PrettyStartDate()) {
                logger.logError('A rota start date is required.', null, 'edit-bin-rota', true);
                return
            }

            var newBinRota = datacontext.createBinRota(session.sessionUser().House());

            newBinRota.Name(newBinType().Name());
            newBinRota.Occurance(newBinType().Occurance());
            newBinRota.PrettyStartDate(newBinType().PrettyStartDate());
            newBinRota.Colour(newBinType().Colour());

            binTypes.push(newBinRota);
            newBinType(initNewBinType());
            // Rebind view attachment events
            viewAttached();
        }

        function initOccuranceOptions() {

            var options = new ko.observableArray();

            options.push({ Name: 'Daily' });
            options.push({ Name: 'Weekly' });
            options.push({ Name: 'Fortnightly' });
            options.push({ Name: 'Monthly' });

            return options;
        }

        function getRotaGroupNames() {

            var groups = new ko.observableArray([{ Id: null, Name: 'No Group' }]);

            $.each(tenants(), function (i, tenant) {
                groups.push({ Id: (i + 1), Name: 'Group ' + (i + 1) });
            });

            return groups;
        }

        function initNewBinType() {

            return data =
                {
                    Name: new ko.observable(''),
                    Occurance: new ko.observable('Weekly'),
                    PrettyStartDate: new ko.observable(''),
                    Colour: new ko.observable('black')
                };
        }

        function groupOptionClicked(selectedGroup, tenant) {
            console.log(tenant);
            tenant.UserSettings().BinCollectionRotaGroup(selectedGroup.Id);

            return datacontext.saveChanges().then(function () {
                logger.logSuccess('Group Change Saved!', null, 'edit-cleaning-rota', true);
            });
        }

        function getRandomRotaGroupName() {

            var groups = getRotaGroupNames();
            var randIndex = Math.floor((Math.random() * groups().length));

            return groups()[randIndex].Name;
        }
    });