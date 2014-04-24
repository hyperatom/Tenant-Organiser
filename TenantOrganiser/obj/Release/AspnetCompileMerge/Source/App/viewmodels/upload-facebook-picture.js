define(['plugins/dialog', 'services/datacontext', 'services/session', 'services/logger'],
    function (dialog, datacontext, session, logger) {

        var that;

        var UploadPictureModal = function () {
            that = this;
        };

        UploadPictureModal.prototype.ok = function () {
            dialog.close(this, this.input());
        };

        UploadPictureModal.show = function () {
            return dialog.show(new UploadPictureModal());
        };

        function close(data) {
            if (data)
                return dialog.close(this, data);

            return dialog.close(this);
        }

        return UploadPictureModal;
    });