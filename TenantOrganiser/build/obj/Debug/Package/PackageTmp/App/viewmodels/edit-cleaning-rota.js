define(['services/logger', 'services/datacontext', 'services/session'],
    function (logger, datacontext, session) {

        var tenants = new ko.observableArray();
        var rotaGroups = new ko.observableArray();

        var communalAreas = new ko.observableArray();
        var newAreaType = new ko.observable();

        var occuranceOptions = new ko.observableArray();

        var vm = {
            activate: activate,
            title: 'Edit Cleaning Rota',
            attached: viewAttached,
            hasChanges: datacontext.hasChanges,

            tenants: tenants,
            rotaGroups: rotaGroups,

            occuranceOptions: occuranceOptions,

            communalAreas: communalAreas,
            newAreaType: newAreaType,

            groupOptionClicked: groupOptionClicked,
            occuranceOptionsClicked: occuranceOptionsClicked,

            deleteAreaClicked: deleteAreaClicked,
            addAreaClicked: addAreaClicked,
            saveAreasClicked: saveAreasClicked,
            undoAreasClicked: undoAreasClicked
        };

        return vm;


        function activate() {

            return Q.all([refreshTenants(), refreshCleaningRotas()]).then(function () {
                rotaGroups(getRotaGroupNames().slice());
                newAreaType(initNewAreaType());
                occuranceOptions(initOccuranceOptions().slice());

                logger.log('Edit Bin Rota View Activated', null, 'edit-bin-rota', true);
            });
        }

        function refreshTenants() {
            return datacontext.getTenants(tenants, session.sessionUser().HouseId());
        }

        function refreshCleaningRotas() {
            return datacontext.getCleaningRotasByHouse(communalAreas, session.sessionUser().HouseId());
        }

        function viewAttached() {
            $(".input-group.date").datepicker({ autoclose: true, todayHighlight: true });
        }

        function saveAreasClicked() {
            return datacontext.saveChanges().then(function () {
                logger.logSuccess('Bin Types Saved!', null, 'edit-cleaning-rota', true);
            });
        }

        function undoAreasClicked() {
            datacontext.rejectChanges();
            refreshCleaningRotas();
            viewAttached();
            logger.log('Communal Areas Reset!', null, 'edit-cleaning-rota', true);

        }

        function occuranceOptionsClicked(selectedOccurance, cleaningRota) {

            cleaningRota.Occurance(selectedOccurance.Name);
        }

        function deleteAreaClicked(data) {

           // $.each(data.CleaningLogs(), function (i, log) {
            //    log.entityAspect.setDeleted();
           // });

            data.entityAspect.setDeleted();
            communalAreas.remove(data);
        }

        function addAreaClicked(data) {

            if (!newAreaType().Name()) {
                logger.logError('An area name is required.', null, 'edit-cleaning-rota', true);
                return
            }

            if (!newAreaType().PrettyStartDate()) {
                logger.logError('A rota start date is required.', null, 'edit-cleaning-rota', true);
                return
            }

            var newCleaningRota = datacontext.createCleaningRota(session.sessionUser().House());

            newCleaningRota.Name(newAreaType().Name());
            newCleaningRota.Occurance(newAreaType().Occurance());
            newCleaningRota.PrettyStartDate(newAreaType().PrettyStartDate());

            communalAreas.push(newCleaningRota);
            newAreaType(initNewAreaType());
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

        function initNewAreaType() {

            return data =
                {
                    Name: new ko.observable(''),
                    Occurance: new ko.observable('Weekly'),
                    PrettyStartDate: new ko.observable(''),
                };
        }

        function groupOptionClicked(selectedGroup, tenant) {
            tenant.UserSettings().CleaningRotaGroup(selectedGroup.Id);
            return datacontext.saveChanges().then(function () {
                logger.logSuccess('Group Change Saved!', null, 'edit-cleaning-rota', true);
            });
        }
    });