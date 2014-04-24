define(['durandal/system', 'services/model', 'config', 'services/logger', 'services/helper'],

    function (system, model, config, logger, helper) {

        var EntityQuery = breeze.EntityQuery,
            manager = configureBreezeManager(),
            initialised = false;

        var primeData = function () {

            if (initialised)
                return;

            return getHouses()
                .then(getUsers)
                .then(getConversations)
                .then(getConversationUsers)
                .then(getMessages)
                .then(getAllBillTypes)
                .then(getBinRotas)
                .then(getCleaningRotas)

                .then(function () { initialised = true; });
        };

        var getLoggedInUser = function (userObservable) {

            var dfd = $.Deferred();

            var xhr = $.ajax({
                type: "GET",
                dataType: "json",
                url: "account/usersession"
            })
                .success(function (data) {

                    if (!data) {
                        userObservable(false);
                        dfd.resolve(false);
                        return;
                    }

                    getUserById(data.Id, userObservable).then(function () {
                        dfd.resolve(userObservable);
                    });
                })

                .fail(function (data) {
                    logError('There was a problem getting the logged in user.', data, true);
                    dfd.resolve(false);
                });

            return dfd.promise();
        };

        var register = function (firstName, lastName, email, password) {

            return $.ajax({
                type: "POST",
                dataType: "json",
                url: "account/register",
                data: helper.AddAntiForgeryToken(
                    {
                        FirstName: firstName,
                        LastName: lastName,
                        Email: email,
                        Password: password
                    })
            });
        };

        var login = function (email, password) {

            return $.ajax({
                type: "POST",
                dataType: "json",
                url: "account/login",
                data: { Email: email, Password: password }
            });
        };

        var facebookLogin = function (token) {

            return $.ajax({
                type: "POST",
                dataType: "json",
                url: "account/facebooklogin",
                data: { token: token }
            });
        };

        var logout = function () {

            return $.ajax({
                type: "POST",
                url: "account/logoff",
                data: helper.AddAntiForgeryToken({})
            });
        };

        var changePassword = function (newPassword) {

            return $.ajax({
                type: "POST",
                url: "account/changepassword",
                data: helper.AddAntiForgeryToken({ password: newPassword })
            });
        };

        var changeEmail = function (newEmail) {

            return $.ajax({
                type: "POST",
                url: "account/changeemail",
                data: { newEmail: newEmail }
            });
        };

        var uploadFacebookPicture = function (username) {
            return $.ajax({
                type: "POST",
                url: "account/uploadfacebookpicture",
                data: { username: username }
            });
        };

        var uploadUrlPicture = function (url) {
            return $.ajax({
                type: "POST",
                url: "account/uploadurlpicture",
                data: { url: url }
            });
        };

        var uploadFilePicture = function (file) {

            return $.ajax({
                type: "POST",
                url: "account/uploadfilepicture",
                data: file,
                cache: false,
                contentType: false,
                processData: false
            });
        };

        var createHouse = function (sessionUserObservable, houseName, houseCode) {

            var houseQuery = EntityQuery.from('Houses').where("HouseCode", "==", houseCode);

            function houseQuerySucceeded(data) {

                if (data.results[0]) {
                    logError('This house code already exists. Please choose a different one.', data, true);
                    return;
                }

                // Create new house entity
                var house = manager.createEntity('House', { HouseName: houseName, HouseCode: houseCode });

                return manager.fetchEntityByKey("User", sessionUserObservable().Id(), true)

                    .then(function (result) {
                        var user = result.entity;
                        user.House(house);
                        manager.saveChanges();

                        logSuccess('Created house!', data, true);
                    })

                    .then(function() {
                        removeUsersHouseRequests(sessionUserObservable);
                    });
            }

            return manager.executeQuery(houseQuery)
                .then(houseQuerySucceeded)
                .fail(queryFailed);
        };

        var removeUsersHouseRequests = function (userObservable) {

            var query = EntityQuery.from('HouseJoinRequests').where("UserId", "==", userObservable().Id());

            return manager.executeQuery(query).then(function (data) {

                $.each(data.results, function (index, value) {
                    value.entityAspect.setDeleted();
                });

                return manager.saveChanges();
            });
        };

        var joinHouse = function (sessionUserObservable, houseCode) {

            var query = EntityQuery.from('Houses').where("HouseCode", "==", houseCode);

            function querySucceeded(data) {

                if (data.results[0]) {

                    var house = data.results[0];

                    // Id property of house object is observable
                    manager.createEntity('HouseJoinRequest', { UserId: sessionUserObservable().Id(), HouseId: house.Id() });
                    return manager.saveChanges().then(function () {
                        logSuccess('Created house join request.', data, true);
                    });
                }

                // If we get this far, house code didn't exist
                logError('House code does not exist.', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var joinTenantToHouse = function (tenantObservable, houseObservable) {

            tenantObservable().HouseId(houseObservable().Id());

            var query = EntityQuery.from('HouseJoinRequests').where("UserId", "==", tenantObservable().Id());

            return manager.executeQuery(query).then(function (data) {

                $.each(data.results, function (index, value) {
                    value.entityAspect.setDeleted();
                });

                return manager.saveChanges();
            });
        };

        var leaveHouse = function (sessionUserObservable) {
            
            sessionUserObservable().HouseId(null);
            console.log(sessionUserObservable());
            return manager.saveChanges();
        };

        var cancelHouseRequest = function (request) {
            request.entityAspect.setDeleted();
            return manager.saveChanges();
        };

        var deleteCommunalMessage = function (msg) {
            msg.entityAspect.setDeleted();
            return manager.saveChanges();
        };

        var getJoinRequestsByUser = function (userObservable) {

            var query = EntityQuery.from('HouseJoinRequests').where("UserId", "==", userObservable().Id());

            function querySucceeded(data) {

                if (data.results)
                    userObservable(data.results);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getUsersJoinRequest = function (sessionUserObservable, joinRequestObservable) {

            var query = EntityQuery.from('HouseJoinRequests').where("UserId", "==", sessionUserObservable().Id());

            function querySucceeded(data) {

                var house = data.results[0];

                if (house)
                    joinRequestObservable(house);
                else
                    joinRequestObservable(null);

                log('Retreived user\'s join request.', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getUserById = function (id, userObservable) {

            var query = EntityQuery.from('Users').where("Id", "==", id).expand("House").expand("UserSettings");

            function querySucceeded(data) {

                if (data.results) {
                    userObservable(data.results[0]);
                }
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getUsers = function (usersObservable) {

            var query = EntityQuery.from('Users').expand("House").expand("UserSettings");

            function querySucceeded(data) {

                if (usersObservable)
                    usersObservable(data.results);

                log('Retrieved [Users] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getBinRotas = function (binRotasObservable) {

            var query = EntityQuery.from('BinRotas');

            function querySucceeded(data) {

                if (binRotasObservable)
                    binRotasObservable(data.results);

                log('Retrieved [Bin Rotas] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getCleaningRotas = function (cleaningRotasObservable) {

            var query = EntityQuery.from('CleaningRotas').expand("CleaningLogs");

            function querySucceeded(data) {

                if (cleaningRotasObservable)
                    cleaningRotasObservable(data.results);

                log('Retrieved [Cleaning Rotas] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getMessages = function (messagesObservable) {

            var query = EntityQuery.from('Messages').expand("Conversation").expand("UserSent");

            function querySucceeded(data) {

                if (messagesObservable)
                    messagesObservable(data.results);

                log('Retrieved [Messages] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getConversationUsers = function (convoUsersObservable) {

            var query = EntityQuery.from('ConversationUsers').expand("User").expand("Conversation");

            function querySucceeded(data) {

                if (convoUsersObservable)
                    convoUsersObservable(data.results);

                log('Retrieved [Conversation Users] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getConversations = function (convoObservable) {

            var query = EntityQuery.from('Conversations').expand("Messages").expand("ConversationUsers").orderByDesc("DateStarted");

            function querySucceeded(data) {

                if (convoObservable)
                    convoObservable(data.results);

                log('Retrieved [Conversations] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getHouses = function (housesObservable) {

            var query = EntityQuery.from('Houses');

            function querySucceeded(data) {

                if (housesObservable)
                    housesObservable(data.results);

                log('Retrieved [Houses] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getBinRotasByHouse = function (binRotasObservable, houseId) {

            var query = EntityQuery.from('BinRotas').where('HouseId', '==', houseId);

            function querySucceeded(data) {
                binRotasObservable(data.results);
                log('Retrieved [Bin Rotas] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getCleaningRotasByHouse = function (cleaningRotasObservable, houseId) {

            var query = EntityQuery.from('CleaningRotas').where('HouseId', '==', houseId);

            function querySucceeded(data) {
                cleaningRotasObservable(data.results);
                log('Retrieved [Cleaning Rotas] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getAnnouncements = function (announcementsObservable, houseId) {

            var query = EntityQuery.from('CommunalMessages').where('HouseId', '==', houseId).orderByDesc('SentDate');

            function querySucceeded(data) {
                announcementsObservable(data.results);
                log('Retrieved [Announcements] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getActivitiyLogs = function (activitiesObservable, HouseId) {

            var query = EntityQuery.from('ActivityLogs').where('HouseId', '==', HouseId).orderByDesc('Date');

            function querySucceeded(data) {
                activitiesObservable(data.results);
                log('Retrieved [Activity Logs] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getWishListItems = function (itemsObservable, HouseId) {

            var query = EntityQuery.from('WishListItems').orderBy('AquiredOn').where('House.Id', '==', HouseId);

            function querySucceeded(data) {
                itemsObservable(data.results);
                log('Retrieved [Wish List Items] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getPendingRequests = function (requestsObservable, HouseId) {

            var query = EntityQuery.from('HouseJoinRequests').where('HouseId', '==', HouseId)
                .expand("User")
                .expand("House");

            function querySucceeded(data) {
                requestsObservable(data.results);
                log('Retrieved [House Join Requests] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getTenants = function (tenantsObservable, HouseId) {

            var query = EntityQuery.from('Users').where('House.Id', '==', HouseId)
                .expand("House")
                .expand("UserSettings");

            function querySucceeded(data) {
                tenantsObservable(data.results);
                log('Retrieved [Tenants] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getTenantsByBinRotaGroup = function (tenantsObservable, HouseId) {

            var query = EntityQuery.from('Users').where('House.Id', '==', HouseId)
                .expand("House")
                .expand("UserSettings");

            function querySucceeded(data) {
                tenantsObservable(data.results);
                log('Retrieved [Tenants] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };
        
        var getAllBillTypes = function () {

            var query = EntityQuery.from('BillTypes')
                .expand("Manager")
                .expand("BillInvoices")
                .expand("BillInvoices.Recipients");

            function querySucceeded(data) {
                log('Retrieved [Bills] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var getBillTypeById = function (billTypeObservable, id) {

            return billTypeObservable(manager.getEntityByKey('BillType', id));
        };

        var getInvoiceById = function (invoiceObservable, id) {

            return invoiceObservable(manager.getEntityByKey('BillInvoice', id));
        };

        var getBillTypesByHouse = function (billTypesObservable, HouseId) {

            var query = EntityQuery.from('BillTypes').where('Manager.HouseId', '==', HouseId)
                .expand("Manager")
                .expand("BillInvoices")
                .expand("BillInvoices.Recipients");

            function querySucceeded(data) {
                billTypesObservable(data.results);
                log('Retrieved [Bills] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        var createAnnouncement = function () {
            return manager.createEntity('CommunalMessage');
        };

        var createWishListItem = function () {
            return manager.createEntity('WishListItem');
        };

        var createMessage = function () {
            return manager.createEntity('Message');
        };

        var createConversation = function () {
            return manager.createEntity('Conversation');
        };

        var createConversationUser = function (convo, user) {
            return manager.createEntity('ConversationUser', { Conversation: convo, User: user });
        };

        var createInvoiceRecipient = function (billInvoice) {
            return manager.createEntity('InvoiceRecipient', { BillInvoice: billInvoice});
        };

        var createBillInvoice = function (billType) {
            return manager.createEntity('BillInvoice', { BillType: billType });
        };

        var createBillType = function () {
            return manager.createEntity('BillType');
        };

        var createBinRota = function (house) {
            return manager.createEntity('BinRota', { House: house });
        };

        var createCleaningRota = function (house) {
            return manager.createEntity('CleaningRota', { House: house });
        };

        var createCleaningRotaLog = function (rotaGroupId, cleaningRotaObservable, date) {
            return manager.createEntity('CleaningLog');
        };

        var deleteInvoice = function (invoice) {
            var invoiceToDelete = manager.getEntityByKey('BillInvoice', invoice.Id());

            $.each(invoiceToDelete.Recipients(), function (i, recip) {
                recip.entityAspect.setDeleted();
            });

            invoiceToDelete.entityAspect.setDeleted();

            return saveChanges();
        };

        var getConversationsByHouse = function (convoObservable, houseId) {
            
            var query = EntityQuery.from('Conversations')
                .where('ConversationUsers', breeze.FilterQueryOp.Any, "User.HouseId", "==", houseId)
                .orderByDesc("DateStarted");

            function querySucceeded(data) {
                convoObservable(data.results);
                log('Retrieved [Conversations] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        function queryFailed(error) {

            var msg = 'Error retreiving data. ' + error.message;

            logger.logError(msg, error, system.getModuleId(datacontext), true);
        }

        function configureBreezeManager() {

            var mgr = new breeze.EntityManager(config.remoteServiceName);

            model.configureMetadataStore(mgr.metadataStore);

            return mgr;
        }

        var rejectChanges = function() {
            return manager.rejectChanges();
        };

        var saveChanges = function() {
            
            return manager.saveChanges()
                .then(saveSucceeded)
                .fail(saveFailed);

            function saveSucceeded(result) {
                logger.log("Changes Saved.", result, system.getModuleId(datacontext), true);
            }

            function saveFailed(error) {
                var msg = 'Saved Failed: <br />' + getErrorMessages(error);
                logError(msg, error, true);
                // Override message attribute to display all error messages as one string
                error.message = msg;
                throw error;
            }
        };

        function getErrorMessages(error) {
            var msg = error.message;

            // If error is a validation error
            if (msg.match(/validation error/i))
                return getValidationMessages(error);

            return msg;
        }

        function getValidationMessages(error) {
    
            try {
                // For each entity with a validation error
                return error.entityErrors.map(function (entity) {
                    return entity.errorMessage;
                    // Extract each validation error and append it to the map array
                    /*return entity.entityAspect.getValidationErrors().map(function (valError) {
                        return valError.errorMessage;
                    }).join('<br />'); // Add a line break to the end of each array element*/
                }).join('<br />');
            }
            catch (e) { }

            return 'validation error';
        }

        var hasChanges = ko.observable(false);

        manager.hasChangesChanged.subscribe(function (eventArgs) {
            hasChanges(eventArgs.hasChanges);
        });

        var datacontext = {

            saveChanges: saveChanges,
            rejectChanges: rejectChanges,
            hasChanges: hasChanges,

            getUsers: getUsers,
            getHouses: getHouses,
            getAllBillTypes: getAllBillTypes,
            getBillTypesByHouse: getBillTypesByHouse,

            getUserById: getUserById,

            getTenants: getTenants,
            getPendingRequests: getPendingRequests,
            getJoinRequestsByUser: getJoinRequestsByUser,
            getBillTypeById: getBillTypeById,
            getInvoiceById: getInvoiceById,
            getBinRotasByHouse: getBinRotasByHouse,
            getCleaningRotasByHouse: getCleaningRotasByHouse,

            getConversations: getConversations,
            getConversationsByHouse: getConversationsByHouse,

            getAnnouncements: getAnnouncements,
            createAnnouncement: createAnnouncement,

            getWishListItems: getWishListItems,
            createWishListItem: createWishListItem,

            getActivitiyLogs: getActivitiyLogs,

            leaveHouse: leaveHouse,

            primeData: primeData,
            getLoggedInUser: getLoggedInUser,

            login: login,
            facebookLogin: facebookLogin,
            logout: logout,
            register: register,
            changePassword: changePassword,
            changeEmail: changeEmail,

            joinHouse: joinHouse,
            joinTenantToHouse: joinTenantToHouse,

            createHouse: createHouse,
            createMessage: createMessage,
            createConversationUser: createConversationUser,
            createConversation: createConversation,
            createBillInvoice: createBillInvoice,
            createInvoiceRecipient: createInvoiceRecipient,
            createBillType: createBillType,
            createBinRota: createBinRota,
            createCleaningRota: createCleaningRota,
            createCleaningRotaLog: createCleaningRotaLog,

            getUsersJoinRequest: getUsersJoinRequest,
            cancelHouseRequest: cancelHouseRequest,

            deleteCommunalMessage: deleteCommunalMessage,
            deleteInvoice: deleteInvoice,

            uploadFacebookPicture: uploadFacebookPicture,
            uploadUrlPicture: uploadUrlPicture,
            uploadFilePicture: uploadFilePicture
        };

        return datacontext;

        function log(msg, data, showToast) {
            //logger.log(msg, data, system.getModuleId(datacontext), showToast);
        }

        function logSuccess(msg, data, showToast) {
            //logger.logSuccess(msg, data, system.getModuleId(datacontext), showToast);
        }

        function logError(msg, data, showToast) {
            logger.logError(msg, data, system.getModuleId(datacontext), showToast);
        }
    });