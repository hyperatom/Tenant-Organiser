define(['services/logger', 'services/datacontext', 'services/session', 'plugins/router', 'durandal/app', './upload-facebook-picture'],
    function (logger, datacontext, session, router, app, UploadPictureModal) {

        var subscriptions = [];

        var isFacebookUser = new ko.observable();

        var hasHouseChanged = new ko.observable(false);
        var hasUserInfoChanged = new ko.observable(false);

        var houseName = new ko.observable();
        var houseCode = new ko.observable();

        var emailNotifications = ko.observable();
        var displayPictureURL = ko.observable();

        var fullName = new ko.observable();
        var email = new ko.observable();
        var password1 = new ko.observable();
        var password2 = new ko.observable();

        var pendingRequests = new ko.observableArray();
        var tenants = new ko.observableArray();

        var tenantMarkedDelete = new ko.observable();

        var profilePictureUrl = new ko.observable();
        var facebookUsername = new ko.observable();

        var vm = {
            activate: activate,
            deactivate: deactivate,
            attached: attached,
            canDeactivate: canDeactivate,
            title: 'Account Settings',

            houseName: houseName,
            houseCode: houseCode,

            emailNotifications: emailNotifications,
            displayPictureURL: displayPictureURL,

            fullName: fullName,
            email: email,
            password1: password1,
            password2: password2,

            pendingRequests: pendingRequests,
            tenants: tenants,

            hasHouseChanged: hasHouseChanged,
            hasUserInfoChanged: hasUserInfoChanged,

            saveHousePanelClicked: saveHousePanelClicked,
            undoHousePanelClicked: undoHousePanelClicked,

            saveUserInfoClicked: saveUserInfoClicked,
            undoUserInfoClicked: undoUserInfoClicked,

            markDeleteTenant: markDeleteTenant,
            deleteTenant: deleteTenant,

            acceptTenant: acceptTenant,
            rejectTenant: rejectTenant,

            leaveHouseConfirmed: leaveHouseConfirmed,
            pictureUploaded: pictureUploaded,

            isFacebookUser: isFacebookUser,

            uploadFacebookPicture: uploadFacebookPicture,
            uploadFilePicture: uploadFilePicture,
            uploadUrlPicture: uploadUrlPicture,

            profilePictureUrl: profilePictureUrl,
            facebookUsername: facebookUsername,
            sessionUser: session.sessionUser
        };

        return vm;


        function activate() {

            isFacebookUser(session.sessionUser().IsFacebookUser());

            return Q.all([refreshHouseJoinRequests(), refreshTenantsList()]).then(function () {

                initFormFields();

                logger.log('Account Settings Activated', null, 'account-settings', true);
            });
        }

        function attached() {
        }

        function uploadFacebookPicture() {
            return datacontext.uploadFacebookPicture(facebookUsername()).then(function (response) {
                if (!response)
                    logger.logError('This picture could not be found.', null, 'account-settings', true);

                return session.refreshSession();
            });
        }

        function uploadFilePicture() {
            var formData = new FormData();
            formData.append("profilePicture", $("#imageFile").get(0).files[0]);

            return datacontext.uploadFilePicture(formData).then(function (response) {
                if (!response)
                    logger.logError('This picture could not be found.', null, 'account-settings', true);

                return session.refreshSession();
            });
        }

        function uploadUrlPicture() {
            return datacontext.uploadUrlPicture(profilePictureUrl()).then(function (response) {
                if (!response)
                    logger.logError('This picture could not be found.', null, 'account-settings', true);

                return session.refreshSession();
            });
        }

        function canDeactivate() {
            if (!datacontext.hasChanges())
                return true;

            var response = app.showMessage(
                'You have unsaved data. Are you sure you want to navigate?',
                'Unsaved Data',
                ['Yes', 'No']);

            return response.then(function (response) {

                if (response === "No")
                    return false;

                if (response === "Yes")
                    datacontext.rejectChanges();

                return true;
            });
        }

        function deactivate() {
            for (var i in subscriptions)
                subscriptions[i].dispose();
        }

        function refreshHouseJoinRequests() {
            return datacontext.getPendingRequests(pendingRequests, session.sessionUser().HouseId());
        }

        function refreshTenantsList() {
            return datacontext.getTenants(tenants, session.sessionUser().HouseId());
        }

        function refreshAllTenantsLists() {
            return Q.all([refreshHouseJoinRequests(), refreshTenantsList()]);
        }

        function pictureUploaded() {

            logger.logSuccess('Picture Uploaded!', null, 'account-settings', true);
        }

        function leaveHouseConfirmed() {

            datacontext.leaveHouse(session.sessionUser).done(function () {
                return session.refreshSession().then(function () {
                    router.navigate('#join-house');
                    logger.logSuccess('You have left the house!', null, 'account-settings', true);
                });
            });
        }

        function acceptTenant(joinRequest) {

            pendingRequests.remove(joinRequest);

            return datacontext.joinTenantToHouse(joinRequest.User, joinRequest.House)
                .then(function () {
                    return refreshAllTenantsLists();
                })
                .then(function () {
                    logger.logSuccess('Tenant Accepted!', null, 'account-settings', true);
                });
        }

        function rejectTenant(joinRequest) {
            var req = joinRequest;
            pendingRequests.remove(joinRequest);
            req.entityAspect.setDeleted();
            return Q.all([datacontext.saveChanges(), refreshHouseJoinRequests()]);
        }

        function markDeleteTenant(data) {

            tenantMarkedDelete(data);
        }

        function deleteTenant() {
            tenantMarkedDelete().HouseId(null);

            return datacontext.saveChanges().then(refreshTenantsList).then(function () {
                logger.logSuccess('Tenant Removed.', null, 'account-settings', true);
            });
        }

        function emailNotificationsClicked(newValue) {

            session.sessionUser().EmailNotifications(newValue);

            if (newValue == true)
                logger.logSuccess('Email Notifications Enabled!', null, 'account-settings', true);
            else
                logger.logSuccess('Email Notifications Disabled!', null, 'account-settings', true);

            return datacontext.saveChanges().fail(function () {
                logger.logSuccess('Email notifications could not be saved.', null, 'account-settings', true);
            });
        }

        function saveUserInfoClicked() {

            if (password1() !== password2()) {
                logger.logError('Both passwords must match.', null, 'account-settings', true);
                return;
            }

            var user = ko.observable();

            return datacontext.getUserById(session.sessionUser().Id(), user).then(function () {

                // If passwords are blank, just save the email/full name
                if (!password1())
                    return saveUserInfo();

                var hash = CryptoJS.SHA256(password1()).toString();

                // If passwords have been changed, save all user info
                return session.changePassword(hash).then(passwordSaved);

                function passwordSaved(data) {
                    if (data.errors) {
                        $.each(data.errors, function (i, val) {
                            logger.logError(val, data.errors, 'account-settings', true);
                        });
                    } else {
                        logger.logSuccess('User Password Saved!', null, 'account-settings', true);
                        return saveUserInfo();
                    }
                }

                function saveUserInfo() {
                    var fullNameArray = fullName().split(' ');

                    user().FirstName(fullNameArray[0]);
                    user().LastName(fullNameArray[fullNameArray.length - 1]);

                    return datacontext.saveChanges().then(function (data) {
                        hasUserInfoChanged(false);
                        logger.logSuccess('User Settings Saved!', null, 'account-settings', true);

                        return session.changeEmail(email()).then(function() {
                            return session.refreshSession();
                        });
                
                    }).fail(function () {
                        user().entityAspect.rejectChanges();
                    });
                }
            });
        }

        function saveHousePanelClicked() {

            session.sessionUser().House().HouseName(houseName());
            session.sessionUser().House().HouseCode(houseCode());

            return datacontext.saveChanges().then(function () {
                hasHouseChanged(false);
                logger.logSuccess('House Settings Saved!', null, 'account-settings', true);
            }).fail(function () {
                logger.logError('Error saving settings.', null, 'account-settings', true);
            });
        }

        function undoHousePanelClicked() {

            houseCode(session.sessionUser().House().HouseCode());
            houseName(session.sessionUser().House().HouseName());

            hasHouseChanged(false);

            logger.logSuccess('House Settings Reset!', null, 'account-settings', true);
        }

        function undoUserInfoClicked() {

            fullName(session.sessionUser().FullName());
            email(session.sessionUser().Email());
            password1('');
            password2('');
            session.sessionUser().entityAspect.rejectChanges();

            hasUserInfoChanged(false);

            logger.logSuccess('User Settings Reset!', null, 'account-settings', true);
        }

        function initFormFields() {

            initHouseInfo();
            initPreferences();
            initUserInfo();
        }

        function initHouseInfo() {
            houseName(session.sessionUser().House().HouseName());
            houseCode(session.sessionUser().House().HouseCode());

            subscriptions.push(houseName.subscribe(function (newValue) {
                hasHouseChanged(true);
            }));

            subscriptions.push(houseCode.subscribe(function (newValue) {
                hasHouseChanged(true);
            }));
        }

        function initPreferences() {
            emailNotifications(session.sessionUser().EmailNotifications());
            displayPictureURL(session.sessionUser().DisplayPictureFilePath());

            subscriptions.push(emailNotifications.subscribe(emailNotificationsClicked));
        }

        function initUserInfo() {

            fullName(session.sessionUser().FullName());
            email(session.sessionUser().Email());
            password1('');
            password2('');

            subscriptions.push(fullName.subscribe(function () {
                hasUserInfoChanged(true);
            }));
            subscriptions.push(email.subscribe(function () {
                hasUserInfoChanged(true);
            }));

            subscriptions.push(password1.subscribe(function () {
                hasUserInfoChanged(true);
            }));

            subscriptions.push(password2.subscribe(function () {
                hasUserInfoChanged(true);
            }));
        }
    });