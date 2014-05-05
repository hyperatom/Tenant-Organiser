/**
 * View model for the Upload Facebook Picture modal.
 * Captures input for the Facebook id or username of the profile picture to be uploaded.
 * 
 * @module viewmodels/upload-facebook-picture
 */
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

        /** 
         * Closes the facebook profile picture modal.
         * 
         * @name module:viewmodels/upload-facebook-picture#close
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

        return UploadPictureModal;
    });