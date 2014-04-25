/**
 * View model for the Edit Bin Rota view. 
 * Performs tasks associated with bin rota management.
 * 
 * @module viewmodels/edit-bin-rota
 */
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

        /** 
         * Activates the view model by initialising required data.
         * 
         * @name module:viewmodels/edit-bin-rota#activate
         * @public
         * @function
         * @returns {Object} A promise returned when all asynchronous queries have completed. 
         */
        function activate() {
            return Q.all([refreshTenants(), refreshBinRotas()]).then(function () {
                rotaGroups(getRotaGroupNames().slice());
                binColourOptions(initBinColourOptions().slice());
                newBinType(initNewBinType());
                occuranceOptions(initOccuranceOptions().slice());
                logger.log('Edit Bin Rota View Activated', null, 'edit-bin-rota', true);
            });
        }

        /** 
         * Refreshes the list of tenants associated with the session user's house.
         * 
         * @name module:viewmodels/edit-bin-rota#refreshTenants
         * @public
         * @function
         * @returns {Object} A promise returned when the tenants have been retrieved.
         */
        function refreshTenants() {
            return datacontext.getUsersByHouse(tenants, session.sessionUser().HouseId());
        }
        
        /** 
         * Refreshes the list of bin rotas associated with the session user's house.
         * 
         * @name module:viewmodels/edit-bin-rota#refreshBinRotas
         * @public
         * @function
         * @returns {Object} A promise returned when the bin rotas been retrieved.
         */
        function refreshBinRotas() {
            return datacontext.getBinRotasByHouse(binTypes, session.sessionUser().HouseId());
        }

        /** 
         * Called when a view is attache to this view model.
         * Initialises the date picker.
         * 
         * @name module:viewmodels/edit-bin-rota#viewAttached
         * @public
         * @function
         */
        function viewAttached() {
            $(".input-group.date").datepicker({ autoclose: true, todayHighlight: true });
        }

        /** 
         * Sets the colour of the selected bin rota with the specified colour object.
         * 
         * @name module:viewmodels/edit-bin-rota#binColourOptionsClicked
         * @public
         * @function
         * @param {Object} selectedColour - Colour object used to set bin rota's colour.
         * @param {Object} binRota - Bin rota to have its colour set.
         */
        function binColourOptionsClicked(selectedColour, binRota) {
            binRota.Colour(selectedColour.Name);
        }

        /** 
         * Initialises an observable array of possible colour objects.
         * 
         * @name module:viewmodels/edit-bin-rota#initBinColourOptions
         * @public
         * @function
         * @returns {Object} Observable array of colour objects.
         */
        function initBinColourOptions() {

            var options = new ko.observableArray();

            options.push({ Name: 'black' });
            options.push({ Name: 'red' });
            options.push({ Name: 'green' });
            options.push({ Name: 'pink' });
            options.push({ Name: 'brown' });

            return options;
        }

        /** 
         * Initialises an observable array of possible occurance objects.
         * 
         * @name module:viewmodels/edit-bin-rota#initOccuranceOptions
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
         * Saves the changes made to the bin types.
         * 
         * @name module:viewmodels/edit-bin-rota#saveBinTypesClicked
         * @public
         * @function
         * @returns {Object} Promise returned when the changes have been saved.
         */
        function saveBinTypesClicked() {
            return datacontext.saveChanges().then(function () {
                logger.logSuccess('Bin Types Saved!', null, 'edit-bin-rota', true);
            });
        }

        /** 
         * Reverts all changes made to the bin rotas since they were last saved.
         * 
         * @name module:viewmodels/edit-bin-rota#undoBinTypesClicked
         * @public
         * @function
         */
        function undoBinTypesClicked() {
            datacontext.rejectChanges();
            refreshBinRotas();
            viewAttached();
            logger.log('Bin Types Reset!', null, 'edit-bin-rota', true);
        }

        /** 
         * Sets the occurance of a bin rota with the specified occurance object.
         * 
         * @name module:viewmodels/edit-bin-rota#occuranceOptionsClicked
         * @public
         * @function
         * @param {Object} selectedOccurance - Occurance used to set occurance of bin rota.
         * @param {Object} binRota - Bin rota to have its occurance set.
         */
        function occuranceOptionsClicked(selectedOccurance, binRota) {
            binRota.Occurance(selectedOccurance.Name);
        }

        /** 
         * Removes a bin type from the list of observable bin types.
         * 
         * @name module:viewmodels/edit-bin-rota#deleteBinTypeClicked
         * @public
         * @function
         * @param {Object} binType - Bin type to be removed.
         */
        function deleteBinTypeClicked(binType) {
            binType.entityAspect.setDeleted();
            binTypes.remove(binType);
        }

        /** 
         * Adds a new bin type to the list of observable bin types.
         * 
         * @name module:viewmodels/edit-bin-rota#addBinTypeClicked
         * @public
         * @function
         * @param {Object} binType - Bin type to be added.
         */
        function addBinTypeClicked(binType) {

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

        /** 
         * Generates a list of possible group names based on the number
         * of tenants in the house.
         * 
         * @name module:viewmodels/edit-bin-rota#getRotaGroupNames
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
         * Initialises the values for the new bin type.
         * 
         * @name module:viewmodels/edit-bin-rota#initNewBinType
         * @public
         * @function
         * @returns {Object} New bin type object.
         */
        function initNewBinType() {
            return data =
                {
                    Name: new ko.observable(''),
                    Occurance: new ko.observable('Weekly'),
                    PrettyStartDate: new ko.observable(''),
                    Colour: new ko.observable('black')
                };
        }

        /** 
        * Sets a users bin rota group to a specified group.
        * 
        * @name module:viewmodels/edit-bin-rota#groupOptionClicked
        * @public
        * @function
        * @param {Object} selectedGroup - Group to be assigned to the specified user.
        * @param {Object} tenant - Tenant to have bin rota group changed.
        * @returns {Object} Promise returned when changes have been saved.
        */
        function groupOptionClicked(selectedGroup, tenant) {
            tenant.UserSettings().BinCollectionRotaGroup(selectedGroup.Id);
            return datacontext.saveChanges().then(function () {
                logger.logSuccess('Group Change Saved!', null, 'edit-cleaning-rota', true);
            });
        }
    });