/**
 * A logging service which provides an interface to toastr.js
 * for showing toast notifications to the screen.
 * 
 * @module services/logger
 */
define(['durandal/system'],

    function (system) {

        var logger = {
            log: log,
            logError: logError,
            logSuccess: logSuccess
        };

        return logger;

        /** 
         * Shows a toast information notification containing a specified message
         * 
         * @name module:services/logger#log
         * @public
         * @function
         * @param {string} message - The message to be displayed in the toast.
         * @param {Object} data - The data to be logged when the toast is displayed.
         * @param {Object} source - The module from which the log has been created.
         * @param {boolean} showToast - Whether to make the toast visible on the screen.
         */
        function log(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'info');
        }

        /** 
         * Shows a toast success notification containing a specified message
         * 
         * @name module:services/logger#logSuccess
         * @public
         * @function
         * @param {string} message - The message to be displayed in the toast.
         * @param {Object} data - The data to be logged when the toast is displayed.
         * @param {Object} source - The module from which the log has been created.
         * @param {boolean} showToast - Whether to make the toast visible on the screen.
         */
        function logSuccess(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'success');
        }

        /** 
         * Shows a toast error notification containing a specified message
         * 
         * @name module:services/logger#logError
         * @public
         * @function
         * @param {string} message - The message to be displayed in the toast.
         * @param {Object} data - The data to be logged when the toast is displayed.
         * @param {Object} source - The module from which the log has been created.
         * @param {boolean} showToast - Whether to make the toast visible on the screen.
         */
        function logError(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'error');
        }

        /** 
         * Shows a toast notification containing a specified message.
         * Toasts are displayed visaully as: information (blue), success (green) or error (red).
         * 
         * @name module:services/logger#logIt
         * @private
         * @function
         * @param {string} message - The message to be displayed in the toast.
         * @param {Object} data - The data to be logged when the toast is displayed.
         * @param {Object} source - The module from which the log has been created.
         * @param {boolean} showToast - Whether to make the toast visible on the screen.
         * @param {string} toastType - The type of toast to display ('info', 'error' or 'success').
         */
        function logIt(message, data, source, showToast, toastType) {
            source = source ? '[' + source + '] ' : '';

            data ? system.log(source, message, data) : system.log(source, message);

            if (showToast) {
                if (toastType === 'error') {
                    toastr.error(message);
                } else if (toastType === 'info') {
                    toastr.info(message);
                } else if (toastType === 'success') {
                    toastr.success(message);
                }
            }
        }
    });