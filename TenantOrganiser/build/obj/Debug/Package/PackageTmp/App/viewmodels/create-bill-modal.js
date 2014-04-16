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

            datacontext.getTenants(tenantsList, session.sessionUser().HouseId());
        };

        CreateBillModal.prototype.ok = function () {
            dialog.close(this, this.input());
        };

        CreateBillModal.show = function () {
            return dialog.show(new CreateBillModal());
        };

        function close(data) {
            if (data)
                return dialog.close(this, data);

            return dialog.close(this);
        }

        function clickedCombo(data, event) {
            manager(data);
        }

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