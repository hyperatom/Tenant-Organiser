/**
 * View model for the bill creation modal. 
 * Performs tasks associated with bill type creation.
 * 
 * @module viewmodels/create-bill-modal
 */
define(['plugins/dialog', 'services/datacontext', 'services/session', 'services/logger'],

    function (dialog, datacontext, session, logger) {

        var billName = new ko.observable();
        var manager = new ko.observable({ FullName: "Select a recipient" });
        var tenantsList = new ko.observableArray();
        var that;

        var CreateBillModal = function () {
            this.input = ko.observable('');
            this.clickedCombo = clickedCombo;
            this.tenantsList = tenantsList;
            this.close = close;
            this.billName = billName;
            this.manager = manager;
            this.createBillType = createBill;
            that = this;

            datacontext.getUsersByHouse(tenantsList, session.sessionUser().HouseId());
        };

        CreateBillModal.prototype.ok = function () {
            dialog.close(this, this.input());
        };

        CreateBillModal.show = function () {
            return dialog.show(new CreateBillModal());
        };

        /** 
         * Closes the bill creation modal.
         * 
         * @name module:viewmodels/create-bill-modal#close
         * @public
         * @function
         * @param {Object} data - Data to be returned when the modal is closed.
         * @returns {Object} The result returned from the modal. 
         */
        function close(data) {
            if (data)
                return dialog.close(this, data);

            return dialog.close(this);
        }

        /** 
         * Sets the new bill manager to the selected tenant.
         * 
         * @name module:viewmodels/create-bill-modal#clickedCombo
         * @public
         * @function
         * @param {Object} tenant - Tenant chosen to be set as the new bill manager.
         */
        function clickedCombo(tenant, event) {
            manager(tenant);
        }

        /** 
         * Creates the new bill using associated observable values.
         * 
         * @name module:viewmodels/create-bill-modal#createBill
         * @public
         * @function
         * @returns {Object} Promise returned when changes have been saved.
         */
        function createBill() {
            if (!billName()) {
                logger.logError('Bill name is required.', null, 'create-bill-modal', true);
                return;
            }
            if (manager().FullName === "Select a recipient") {
                logger.logError('Bill manager is required.', null, 'create-bill-modal', true);
                return;
            }

            var newBillType = datacontext.createBillType();
            newBillType.Manager(manager());
            newBillType.Name(billName());

            datacontext.saveChanges().then(function (response) {
                logger.logSuccess(billName() + ' created.', null, 'create-bill-modal', true);
                return that.close(this, true);
            });
        }

        return CreateBillModal;
    });