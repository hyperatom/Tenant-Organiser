/**
 * View model for the Edit Cleaning Rota view. 
 * Performs tasks associated with cleaning rota management.
 * 
 * @module viewmodels/edit-cleaning-rota
 */
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

        /** 
         * Activates the view model by initialising required data.
         * 
         * @name module:viewmodels/edit-cleaning-rota#activate
         * @public
         * @function
         * @returns {Object} A promise returned when all asynchronous queries have completed. 
         */
        function activate() {
            return Q.all([refreshTenants(), refreshCleaningRotas()]).then(function () {
                rotaGroups(getRotaGroupNames().slice());
                newAreaType(initNewAreaType());
                occuranceOptions(initOccuranceOptions().slice());
                logger.log('Edit Bin Rota View Activated', null, 'edit-bin-rota', true);
            });
        }

        /** 
         * Refreshes the list of tenants associated with the session user's house.
         * 
         * @name module:viewmodels/edit-cleaning-rota#refreshTenants
         * @public
         * @function
         * @returns {Object} A promise returned when the tenants have been retrieved.
         */
        function refreshTenants() {
            return datacontext.getUsersByHouse(tenants, session.sessionUser().HouseId());
        }

        /** 
         * Refreshes the list of cleaning rotas associated with the session user's house.
         * 
         * @name module:viewmodels/edit-cleaning-rota#refreshCleaningRotas
         * @public
         * @function
         * @returns {Object} A promise returned when the cleaning rotas been retrieved.
         */
        function refreshCleaningRotas() {
            return datacontext.getCleaningRotasByHouse(communalAreas, session.sessionUser().HouseId());
        }

        /** 
         * Called when a view is attache to this view model.
         * Initialises the date picker.
         * 
         * @name module:viewmodels/edit-cleaning-rota#viewAttached
         * @public
         * @function
         */
        function viewAttached() {
            $(".input-group.date").datepicker({ autoclose: true, todayHighlight: true });
        }

        /** 
         * Saves changes made to the communal areas.
         * 
         * @name module:viewmodels/edit-cleaning-rota#saveAreasClicked
         * @public
         * @function
         * @returns {Object} Promise returned when changes have been saved.
         */
        function saveAreasClicked() {
            return datacontext.saveChanges().then(function () {
                logger.logSuccess('Bin Types Saved!', null, 'edit-cleaning-rota', true);
            });
        }

        /** 
         * Resets all changes made to communal areas since they were last saved.
         * 
         * @name module:viewmodels/edit-cleaning-rota#undoAreasClicked
         * @public
         * @function
         */
        function undoAreasClicked() {
            datacontext.rejectChanges();
            refreshCleaningRotas();
            viewAttached();
            logger.log('Communal Areas Reset!', null, 'edit-cleaning-rota', true);
        }

        /** 
        * Sets the occurance of a cleaning rota with the specified occurance object.
        * 
        * @name module:viewmodels/edit-cleaning-rota#occuranceOptionsClicked
        * @public
        * @function
        * @param {Object} selectedOccurance - Occurance used to set occurance of cleaning rota.
        * @param {Object} cleaningRota - Cleaning rota to have its occurance set.
        */
        function occuranceOptionsClicked(selectedOccurance, cleaningRota) {
            cleaningRota.Occurance(selectedOccurance.Name);
        }

        /** 
        * Marks a communal area for deletion.
        * 
        * @name module:viewmodels/edit-cleaning-rota#deleteAreaClicked
        * @public
        * @function
        * @param {Object} rota - Cleaning rota to be deleted.
        */
        function deleteAreaClicked(rota) {
            rota.entityAspect.setDeleted();
            communalAreas.remove(rota);
        }

        /** 
        * Adds a new communal area to the list of observable communal areas.
        * 
        * @name module:viewmodels/edit-cleaning-rota#addAreaClicked
        * @public
        * @function
        * @param {Object} rota - Cleaning rota to be added.
        */
        function addAreaClicked(rota) {
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

        /** 
         * Initialises an observable array of possible occurance objects.
         * 
         * @name module:viewmodels/edit-cleaning-rota#initOccuranceOptions
         * @public
         * @function
         * @returns {Object} Observable array of occurance objects.
         */
        function initOccuranceOptions() {

            var options = new ko.observableArray();

            options.push({ Name: 'Daily' });
            options.push({ Name: 'Weekly' });
            options.push({ Name: 'Fortnightly' });
            options.push({ Name: 'Monthly' });

            return options;
        }

        /** 
         * Generates a list of possible group names based on the number
         * of tenants in the house.
         * 
         * @name module:viewmodels/edit-cleaning-rota#getRotaGroupNames
         * @public
         * @function
         * @returns {Object} Observable array of group names.
         */
        function getRotaGroupNames() {
            var groups = new ko.observableArray([{ Id: null, Name: 'No Group' }]);

            $.each(tenants(), function (i, tenant) {
                groups.push({ Id: (i + 1), Name: 'Group ' + (i + 1) });
            });

            return groups;
        }

        /** 
         * Initialises the new area with default values.
         * 
         * @name module:viewmodels/edit-cleaning-rota#initNewAreaType
         * @public
         * @function
         * @returns {Object} New communal area object.
         */
        function initNewAreaType() {
            return data =
                {
                    Name: new ko.observable(''),
                    Occurance: new ko.observable('Weekly'),
                    PrettyStartDate: new ko.observable(''),
                };
        }

        /** 
        * Sets a users cleaning rota group to a specified group.
        * 
        * @name module:viewmodels/edit-cleaning-rota#groupOptionClicked
        * @public
        * @function
        * @param {Object} selectedGroup - Group to be assigned to the specified user.
        * @param {Object} tenant - Tenant to have cleaning rota group changed.
        * @returns {Object} Promise returned when changes have been saved.
        */
        function groupOptionClicked(selectedGroup, tenant) {
            tenant.UserSettings().CleaningRotaGroup(selectedGroup.Id);
            return datacontext.saveChanges().then(function () {
                logger.logSuccess('Group Change Saved!', null, 'edit-cleaning-rota', true);
            });
        }
    });