﻿/**
 * Provides an interface to access the database via the breeze.js entity manager.
 * This module follows the Unit of Work pattern whereby the side effects of functions
 * are not applied to the database until saveChanges() is called.
 * 
 * @module services/datacontext
 */
define(['durandal/system', 'services/model', '../config', 'services/logger', 'services/helper'],

    function (system, model, config, logger, helper) {

        // Initialise breeze
        var EntityQuery = breeze.EntityQuery,
            manager = configureBreezeManager(),
            hasChanges = ko.observable(false),
            initialised = false;

        // Update the hasChanges() observable when the manager has changes
        manager.hasChangesChanged.subscribe(function (eventArgs) {
            hasChanges(eventArgs.hasChanges);
        });

        /** 
         * Primes the application data by retrieving all data entities
         * and storing them in the local breeze.js cache when called.
         * 
         * @name module:services/datacontext#primeData
         * @public
         * @function
         */
        var primeData = function () {

            if (initialised)
                return;

            return getHouses()
                .then(getUsers)
                .then(getConversations)
                .then(getConversationUsers)
                .then(getMessages)
                .then(getBillTypes)
                .then(getBinRotas)
                .then(getCleaningRotas)

                .then(function () { initialised = true; });
        };

        /** 
         * Gets the currently logged in session user from the server as a JSON object.
         * 
         * @name module:services/datacontext#getLoggedInUser
         * @public
         * @function
         * @param {Object} userObservable - The knockout observable to be set to the session user.
         * @returns {boolean | Object} False if a server session does not exist or session user object otherwise.
         */
        var getLoggedInUser = function (userObservable) {

            return $.ajax({
                type: "GET",
                dataType: "json",
                url: "account/usersession"
            }).success(function (data) {
                if (!data)
                    return userObservable(false);

                return getUserById(data.Id, userObservable).then(function () {
                    return userObservable;
                });
            }).error(function (data) {
                logError('There was a problem getting the logged in user.', data, true);
                return false;
            });
        };

        /** 
         * Registers a new user with the database.
         * 
         * @name module:services/datacontext#register
         * @public
         * @function
         * @param {string} firstName - The first name of the user being registered.
         * @param {string} lastName - The last name of the user being registered.
         * @param {string} email - The email of the user being registered.
         * @param {string} password - The password of the user being registered.
         * @returns {Object} Promise of the asynchronous ajax call.
         */
        var register = function (firstName, lastName, email, password) {
            return $.ajax({
                type: "POST",
                dataType: "json",
                url: "account/register",
                data: helper.addAntiForgeryToken(
                    {
                        FirstName: firstName,
                        LastName: lastName,
                        Email: email,
                        Password: password
                    })
            });
        };

        /** 
         * Creates a new session with the server using an existing user.
         * 
         * @name module:services/datacontext#login
         * @public
         * @function
         * @param {string} email - The email of the user being logged in.
         * @param {string} password - The password of the user being logged in.
         * @returns {Object} Promise of the asynchronous ajax call.
         */
        var login = function (email, password) {
            return $.ajax({
                type: "POST",
                dataType: "json",
                url: "account/login",
                data: { Email: email, Password: password }
            });
        };

        /** 
         * Creates a new session with the server using an existing Facebook user.
         * 
         * @name module:services/datacontext#facebookLogin
         * @public
         * @function
         * @param {string} token - The token received when a user successfully authenticates with Facebook.
         * @returns {Object} Promise of the asynchronous ajax call.
         */
        var facebookLogin = function (token) {
            return $.ajax({
                type: "POST",
                dataType: "json",
                url: "account/facebooklogin",
                data: { token: token }
            });
        };

        /** 
         * Logs the currently logged in user out, by destroying the server session.
         * 
         * @name module:services/datacontext#logout
         * @public
         * @function
         * @returns {Object} Promise of the asynchronous ajax call.
         */
        var logout = function () {
            return $.ajax({
                type: "POST",
                url: "account/logoff",
                data: helper.addAntiForgeryToken({})
            });
        };

        /** 
         * Changes the password of the current session user.
         * 
         * @name module:services/datacontext#changePassword
         * @public
         * @function
         * @param {string} newPassword - New password for the session user.
         * @returns {Object} Promise of the asynchronous ajax call.
         */
        var changePassword = function (newPassword) {
            return $.ajax({
                type: "POST",
                url: "account/changepassword",
                data: helper.addAntiForgeryToken({ password: newPassword })
            });
        };

        /** 
         * Changes the email of the current session user.
         * 
         * @name module:services/datacontext#changeEmail
         * @public
         * @function
         * @param {string} newEmail - New email for the session user.
         * @returns {Object} Promise of the asynchronous ajax call.
         */
        var changeEmail = function (newEmail) {
            return $.ajax({
                type: "POST",
                url: "account/changeemail",
                data: { newEmail: newEmail }
            });
        };

        /** 
         * Uses a facebook profile picture as the account profile picture.
         * 
         * @name module:services/datacontext#uploadFacebookPicture
         * @public
         * @function
         * @param {string} username - Username or Id of the Facebook picture's user account.
         * @returns {Object} Promise of the asynchronous ajax call.
         */
        var uploadFacebookPicture = function (username) {
            return $.ajax({
                type: "POST",
                url: "account/uploadfacebookpicture",
                data: { username: username }
            });
        };

        /** 
         * Uses a web image as the account profile picture.
         * 
         * @name module:services/datacontext#uploadUrlPicture
         * @public
         * @function
         * @param {string} url - URL of the web image to use as the users profile picture.
         * @returns {Object} Promise of the asynchronous ajax call.
         */
        var uploadUrlPicture = function (url) {
            return $.ajax({
                type: "POST",
                url: "account/uploadurlpicture",
                data: { url: url }
            });
        };

        /** 
         * Uploads an image from a user's file system to use as the profile picture.
         * 
         * @name module:services/datacontext#uploadFilePicture
         * @public
         * @function
         * @param {Object} file - Form Data object containing the uploaded file.
         * @returns {Object} Promise of the asynchronous ajax call.
         */
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

        /** 
         * Creates a new house entity, joins the creating user to the house and removes
         * any of the user's existing house join requests.
         * 
         * @name module:services/datacontext#createHouse
         * @public
         * @function
         * @param {Object} sessionUserObservable - Form Data object containing the uploaded file.
         * @param {string} houseName - Name of the house to be created.
         * @param {string} houseCode - Unique code for the house to be created.
         * @returns {Object} Promise of the asynchronous query.
         */
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

                    .then(function () {
                        removeUsersHouseRequests(sessionUserObservable);
                    });
            }

            return manager.executeQuery(houseQuery)
                .then(houseQuerySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Removes any existing house join requests that a user has created.
         * 
         * @name module:services/datacontext#removeUsersHouseRequests
         * @public
         * @function
         * @param {Object} userObservable - The user to have house join requests removed.
         * @returns {Object} Promise of the asynchronous query.
         */
        var removeUsersHouseRequests = function (userObservable) {

            var query = EntityQuery.from('HouseJoinRequests').where("UserId", "==", userObservable().Id());

            return manager.executeQuery(query).then(function (data) {
                $.each(data.results, function (index, value) {
                    // Delete each of the house join request entities
                    value.entityAspect.setDeleted();
                });
                return manager.saveChanges();
            });
        };

        /** 
         * Creates a house join request for the specified user.
         * 
         * @name module:services/datacontext#requestHouseJoin
         * @public
         * @function
         * @param {Object} sessionUserObservable - The user requesting to join the house.
         * @param {string} houseCode - Unique code of the house to send the request to.
         * @returns {Object} Promise of the asynchronous query.
         */
        var requestHouseJoin = function (sessionUserObservable, houseCode) {

            var query = EntityQuery.from('Houses').where("HouseCode", "==", houseCode);

            function querySucceeded(data) {
                // If a house with the specified code exists
                if (data.results[0]) {
                    var house = data.results[0];

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

        /** 
         * Joins a user to a specified house.
         * 
         * @name module:services/datacontext#joinTenantToHouse
         * @public
         * @function
         * @param {Object} tenantObservable - The user to be joined to the house.
         * @param {Object} houseObservable - Unique code of the house to join the user.
         * @returns {Object} Promise of the asynchronous query.
         */
        var joinTenantToHouse = function (tenantObservable, houseObservable) {

            tenantObservable().HouseId(houseObservable().Id());

            var query = EntityQuery.from('HouseJoinRequests').where("UserId", "==", tenantObservable().Id());

            return manager.executeQuery(query).then(function (data) {

                $.each(data.results, function (index, value) {
                    // Existing join requests are no longer needed
                    value.entityAspect.setDeleted();
                });

                return manager.saveChanges();
            });
        };

        /** 
         * Sets a house join request object to a user's house join request object.
         * Sets the object value to null if no requests were found.
         * 
         * @name module:services/datacontext#getUsersJoinRequest
         * @public
         * @function
         * @param {Object} sessionUserObservable - The user who's join request we want to retrieve.
         * @param {Object} joinRequestObservable - The observable to be set to the found join request.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getUsersJoinRequest = function (sessionUserObservable, joinRequestObservable) {

            var query = EntityQuery.from('HouseJoinRequests').where("UserId", "==", sessionUserObservable().Id());

            function querySucceeded(data) {
                var house = data.results[0];
                house ? joinRequestObservable(house) : joinRequestObservable(null);
                log('Retreived user\'s join request.', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Sets a house join request object to a user's house join request object.
         * Sets the object value to null if no requests were found.
         * 
         * @name module:services/datacontext#getUserById
         * @public
         * @function
         * @param {number} id - The id of the user we want to retrieve.
         * @param {Object} userObservable - The observable to be set to the found user.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getUserById = function (id, userObservable) {

            var query = EntityQuery.from('Users').where("Id", "==", id).expand("House").expand("UserSettings");

            function querySucceeded(data) {
                data.results ? userObservable(data.results[0]) : null;
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Gets all users from the database.
         * 
         * @name module:services/datacontext#getUsers
         * @public
         * @function
         * @param {Object} usersObservable - The observable to be set to the found users.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getUsers = function (usersObservable) {

            var query = EntityQuery.from('Users').expand("House").expand("UserSettings");

            function querySucceeded(data) {
                usersObservable ? usersObservable(data.results) : null;
                log('Retrieved [Users] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Gets all bin rotas from the database.
         * 
         * @name module:services/datacontext#getBinRotas
         * @public
         * @function
         * @param {Object} binRotasObservable - The observable to be set to the found bin rotas.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getBinRotas = function (binRotasObservable) {

            var query = EntityQuery.from('BinRotas');

            function querySucceeded(data) {
                binRotasObservable ? binRotasObservable(data.results) : null;
                log('Retrieved [Bin Rotas] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Gets all cleaning rotas from the database.
         * 
         * @name module:services/datacontext#getCleaningRotas
         * @public
         * @function
         * @param {Object} cleaningRotasObservable - The observable to be set to the found cleaning rotas.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getCleaningRotas = function (cleaningRotasObservable) {

            var query = EntityQuery.from('CleaningRotas').expand("CleaningLogs");

            function querySucceeded(data) {
                cleaningRotasObservable ? cleaningRotasObservable(data.results) : null;
                log('Retrieved [Cleaning Rotas] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Gets all communal messages from the database.
         * 
         * @name module:services/datacontext#getMessages
         * @public
         * @function
         * @param {Object} messagesObservable - The observable to be set to the found communal messages.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getMessages = function (messagesObservable) {

            var query = EntityQuery.from('Messages').expand("Conversation").expand("UserSent");

            function querySucceeded(data) {
                messagesObservable ? messagesObservable(data.results) : null;
                log('Retrieved [Messages] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Gets all conversation users from the database.
         * 
         * @name module:services/datacontext#getConversationUsers
         * @public
         * @function
         * @param {Object} convoUsersObservable - The observable to be set to the found conversation users.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getConversationUsers = function (convoUsersObservable) {

            var query = EntityQuery.from('ConversationUsers').expand("User").expand("Conversation");

            function querySucceeded(data) {
                convoUsersObservable ? convoUsersObservable(data.results) : null;
                log('Retrieved [Conversation Users] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Gets all conversations from the database.
         * 
         * @name module:services/datacontext#getConversations
         * @public
         * @function
         * @param {Object} convoObservable - The observable to be set to the found conversations.
         * @returns {Object} Promise of the asynchronous query.
         */
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

        /** 
         * Gets all houses from the database.
         * 
         * @name module:services/datacontext#getHouses
         * @public
         * @function
         * @param {Object} housesObservable - The observable to be set to the found houses.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getHouses = function (housesObservable) {

            var query = EntityQuery.from('Houses');

            function querySucceeded(data) {
                housesObservable ? housesObservable(data.results) : null;
                log('Retrieved [Houses] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Loads all the bin types from the database into breeze.js.
         * 
         * @name module:services/datacontext#getBillTypes
         * @private
         * @function
         * @returns {Object} Promise of the asynchronous query.
         */
        var getBillTypes = function () {

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

        /** 
         * Gets all bin rotas associated with a specified house.
         * 
         * @name module:services/datacontext#getBinRotasByHouse
         * @public
         * @function
         * @param {Object} binRotasObservable - The observable to be set to the found bin rotas.
         * @param {Object} houseId - The id of the house used to retireve the associated bin rotas.
         * @returns {Object} Promise of the asynchronous query.
         */
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

        /** 
         * Gets all cleaning rotas associated with a specified house.
         * 
         * @name module:services/datacontext#getCleaningRotasByHouse
         * @public
         * @function
         * @param {Object} cleaningRotasObservable - The observable to be set to the found cleaning rotas.
         * @param {Object} houseId - The id of the house used to retireve the associated cleaning rotas.
         * @returns {Object} Promise of the asynchronous query.
         */
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

        /** 
         * Gets all communal announcements associated with a specified house.
         * 
         * @name module:services/datacontext#getAnnouncementsByHouse
         * @public
         * @function
         * @param {Object} announcementsObservable - The observable to be set to the found communal announcements.
         * @param {Object} houseId - The id of the house used to retireve the associated communal announcements.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getAnnouncementsByHouse = function (announcementsObservable, houseId) {

            var query = EntityQuery.from('CommunalMessages').where('HouseId', '==', houseId).orderByDesc('SentDate');

            function querySucceeded(data) {
                announcementsObservable(data.results);
                log('Retrieved [Announcements] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Gets all communal announcements associated with a specified house.
         * 
         * @name module:services/datacontext#getActivitiyLogsByHouse
         * @public
         * @function
         * @param {Object} activitiesObservable - The observable to be set to the found communal announcements.
         * @param {Object} houseId - The id of the house used to retireve the associated communal announcements.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getActivitiyLogsByHouse = function (activitiesObservable, houseId) {

            var query = EntityQuery.from('ActivityLogs').where('HouseId', '==', houseId).orderByDesc('Date');

            function querySucceeded(data) {
                activitiesObservable(data.results);
                log('Retrieved [Activity Logs] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Gets all wish list items associated with a specified house.
         * 
         * @name module:services/datacontext#getWishListItemsByHouse
         * @public
         * @function
         * @param {Object} itemsObservable - The observable to be set to the found wish list items.
         * @param {Object} houseId - The id of the house used to retireve the associated wish list items.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getWishListItemsByHouse = function (itemsObservable, houseId) {

            var query = EntityQuery.from('WishListItems').orderBy('AquiredOn').where('House.Id', '==', houseId);

            function querySucceeded(data) {
                itemsObservable(data.results);
                log('Retrieved [Wish List Items] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Gets all house join requests pending for a specified house.
         * 
         * @name module:services/datacontext#getPendingRequestsByHouse
         * @public
         * @function
         * @param {Object} requestsObservable - The observable to be set to the found pending requests object.
         * @param {Object} houseId - The id of the house used to retireve the pending requests from.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getPendingRequestsByHouse = function (requestsObservable, houseId) {

            var query = EntityQuery.from('HouseJoinRequests').where('HouseId', '==', houseId)
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

        /** 
         * Gets all users who have joined the specified house.
         * 
         * @name module:services/datacontext#getUsersByHouse
         * @public
         * @function
         * @param {Object} usersObservable - The observable to be set to the found users object.
         * @param {Object} houseId - The id of the house used to retireve the associated users.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getUsersByHouse = function (usersObservable, houseId) {

            var query = EntityQuery.from('Users').where('House.Id', '==', houseId)
                .expand("House")
                .expand("UserSettings");

            function querySucceeded(data) {
                usersObservable(data.results);
                log('Retrieved [Tenants] from remote data source', data, true);
            }

            return manager.executeQuery(query)
                .then(querySucceeded)
                .fail(queryFailed);
        };

        /** 
         * Gets all the bill types that are assocated with the specified house.
         * 
         * @name module:services/datacontext#getBillTypesByHouse
         * @public
         * @function
         * @param {Object} billTypesObservable - The observable to be set to the found bill types object.
         * @param {Object} houseId - The id of the house used to retireve the associated bill types.
         * @returns {Object} Promise of the asynchronous query.
         */
        var getBillTypesByHouse = function (billTypesObservable, houseId) {

            var query = EntityQuery.from('BillTypes').where('Manager.HouseId', '==', houseId)
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

        /** 
         * Gets all the conversations that are assocated with the specified house.
         * 
         * @name module:services/datacontext#getConversationsByHouse
         * @public
         * @function
         * @param {Object} convoObservable - The observable to be set to the found conversations object.
         * @param {Object} houseId - The id of the house used to retireve the associated conversations.
         * @returns {Object} Promise of the asynchronous query.
         */
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

        /** 
         * Gets a bill type object with the specified id.
         * 
         * @name module:services/datacontext#getBillTypeById
         * @public
         * @function
         * @param {Object} billTypeObservable - The observable that will be set to the found bill type.
         * @param {number} id - The id of the bill type to be found.
         * @returns {Object} The bill type observable containing the found bill type object.
         */
        var getBillTypeById = function (billTypeObservable, id) {
            return billTypeObservable(manager.getEntityByKey('BillType', id));
        };

        /** 
         * Gets an invoice object with the specified id.
         * 
         * @name module:services/datacontext#getInvoiceById
         * @public
         * @function
         * @param {Object} invoiceObservable - The observable that will be set to the found invoice.
         * @param {number} id - The id of the invoice to be found.
         * @returns {Object} The invoice observable containing the found invoice object.
         */
        var getInvoiceById = function (invoiceObservable, id) {
            return invoiceObservable(manager.getEntityByKey('BillInvoice', id));
        };

        /** 
         * Creates a new communal announcement entity.
         * 
         * @name module:services/datacontext#createAnnouncement
         * @public
         * @function
         * @returns {Object} The created communal announcement entity.
         */
        var createAnnouncement = function () {
            return manager.createEntity('CommunalMessage');
        };

        /** 
         * Creates a new wish list item entity.
         * 
         * @name module:services/datacontext#createWishListItem
         * @public
         * @function
         * @returns {Object} The created wish list item entity.
         */
        var createWishListItem = function () {
            return manager.createEntity('WishListItem');
        };

        /** 
         * Creates a new message entity.
         * 
         * @name module:services/datacontext#createMessage
         * @public
         * @function
         * @returns {Object} The created message entity.
         */
        var createMessage = function () {
            return manager.createEntity('Message');
        };

        /** 
         * Creates a new conversation entity.
         * 
         * @name module:services/datacontext#createConversation
         * @public
         * @function
         * @returns {Object} The created conversation entity.
         */
        var createConversation = function () {
            return manager.createEntity('Conversation');
        };

        /** 
         * Creates a new conversation user entity.
         * 
         * @name module:services/datacontext#createConversationUser
         * @public
         * @function
         * @param {Object} convo - The conversation used to join with the user.
         * @param {Object} user - The user used to join with the conversation.
         * @returns {Object} The created conversation user entity.
         */
        var createConversationUser = function (convo, user) {
            return manager.createEntity('ConversationUser', { Conversation: convo, User: user });
        };

        /** 
         * Creates a new invoice recipient entity.
         * 
         * @name module:services/datacontext#createInvoiceRecipient
         * @public
         * @function
         * @param {Object} billInvoice - The invoice associated with the recipient to be created.
         * @returns {Object} The created invoice recipient entity.
         */
        var createInvoiceRecipient = function (billInvoice) {
            return manager.createEntity('InvoiceRecipient', { BillInvoice: billInvoice });
        };

        /** 
         * Creates a new bill invoice entity.
         * 
         * @name module:services/datacontext#createBillInvoice
         * @public
         * @function
         * @param {Object} billType - The bill type associated with the invoice to be created.
         * @returns {Object} The created bill invoice entity.
         */
        var createBillInvoice = function (billType) {
            return manager.createEntity('BillInvoice', { BillType: billType });
        };

        /** 
         * Creates a new bill type entity.
         * 
         * @name module:services/datacontext#createBillType
         * @public
         * @function
         * @returns {Object} The created bill type entity.
         */
        var createBillType = function () {
            return manager.createEntity('BillType');
        };

        /** 
         * Creates a new bin rota entity.
         * 
         * @name module:services/datacontext#createBinRota
         * @public
         * @function
         * @param {Object} house - The house associated with the bin rota to be created.
         * @returns {Object} The created bin rota entity.
         */
        var createBinRota = function (house) {
            return manager.createEntity('BinRota', { House: house });
        };

        /** 
         * Creates a new cleaning rota entity.
         * 
         * @name module:services/datacontext#createCleaningRota
         * @public
         * @function
         * @param {Object} house - The house associated with the cleaning rota to be created.
         * @returns {Object} The created cleaning rota entity.
         */
        var createCleaningRota = function (house) {
            return manager.createEntity('CleaningRota', { House: house });
        };

        /** 
         * Creates a new cleaning rota log entity.
         * 
         * @name module:services/datacontext#createCleaningRotaLog
         * @public
         * @function
         * @returns {Object} The created cleaning rota log entity.
         */
        var createCleaningRotaLog = function () {
            return manager.createEntity('CleaningLog');
        };

        /** 
         * Deletes a specified bill invoice and all of the associated recipients.
         * 
         * @name module:services/datacontext#deleteInvoice
         * @public
         * @function
         * @param {Object} invoice - The invoice entity to be deleted.
         * @returns {Object} The promise returned by the saveChanges() function.
         */
        var deleteInvoice = function (invoice) {
            var invoiceToDelete = manager.getEntityByKey('BillInvoice', invoice.Id());

            $.each(invoiceToDelete.Recipients(), function (i, recip) {
                recip.entityAspect.setDeleted();
            });

            invoiceToDelete.entityAspect.setDeleted();

            return saveChanges();
        };

        /** 
         * Shows a screen toast notification containing query errors.
         * 
         * @name module:services/datacontext#queryFailed
         * @private
         * @function
         * @param {Object} error - The error object used to extract the errors.
         */
        function queryFailed(error) {
            var msg = 'Error retreiving data. ' + error.message;
            logError(msg, error, true);
        }

        /** 
         * Configures the breeze.js manager by setting the remote service name
         * and configuring the meta data store for external entity discovery.
         * 
         * @name module:services/datacontext#configureBreezeManager
         * @private
         * @function
         * @returns {Object} The configured breeze manager object.
         */
        function configureBreezeManager() {
            var mgr = new breeze.EntityManager(config.remoteServiceName);
            model.configureMetadataStore(mgr.metadataStore);
            return mgr;
        }

        /** 
         * Rolls back the state of the local entity cache to that when
         * it was last saved to the database. This method discards any changes
         * made to the data context since it was last changed.
         * 
         * @name module:services/datacontext#rejectChanges
         * @public
         * @function
         * @returns {Object} The result of the rejectChanges() function.
         */
        var rejectChanges = function () {
            return manager.rejectChanges();
        };

        /** 
         * Saves the state of the local breeze entity cache to the database.
         * 
         * @name module:services/datacontext#saveChanges
         * @public
         * @function
         * @returns {Object} The result of the saveChanges() function.
         */
        var saveChanges = function () {

            return manager.saveChanges().then(saveSucceeded).fail(saveFailed);

            function saveSucceeded(result) {
                log("Changes Saved.", result, true);
            }

            function saveFailed(error) {
                var msg = 'Saved Failed: <br />' + getErrorMessages(error);
                logError(msg, error, true);
                // Override message attribute to display all error messages as one string
                error.message = msg;
                throw error;
            }
        };

        /** 
         * Extracts the error messages accumulated in the specified error object.
         * 
         * @name module:services/datacontext#getErrorMessages
         * @private
         * @function
         * @param {Object} error - The object used to extract error messgaes.
         * @returns {string} The concatenated string of errors from the error object.
         */
        function getErrorMessages(error) {
            var msg = error.message;

            // If error is a validation error
            if (msg.match(/validation error/i))
                return getValidationMessages(error);

            return msg;
        }

        /** 
         * Formats a specified error object into valid HTML to be displayed.
         * 
         * @name module:services/datacontext#getValidationMessages
         * @private
         * @function
         * @param {Object} error - The object used to extract error messgaes.
         * @returns {string} The formatted HTML containing errors as text from the error object.
         */
        function getValidationMessages(error) {
            try {
                // For each entity with a validation error
                return error.entityErrors.map(function (entity) {
                    return entity.errorMessage;
                }).join('<br />');
            }
            catch (e) { }

            return 'validation error';
        }

        /** 
         * Shows a toast information notification containing a specified message
         * 
         * @name module:services/datacontext#log
         * @private
         * @function
         * @param {string} msg - The message to be displayed in the toast.
         * @param {Object} data - The data to be logged when the toast is displayed.
         * @param {boolean} showToast - Whether to make the toast visible on the screen.
         */
        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(datacontext), showToast);
        }

        /** 
         * Shows a toast success notification containing a specified message
         * 
         * @name module:services/datacontext#log
         * @private
         * @function
         * @param {string} msg - The message to be displayed in the toast.
         * @param {Object} data - The data to be logged when the toast is displayed.
         * @param {boolean} showToast - Whether to make the toast visible on the screen.
         */
        function logSuccess(msg, data, showToast) {
            logger.logSuccess(msg, data, system.getModuleId(datacontext), showToast);
        }

        /** 
         * Shows a toast error notification containing a specified message
         * 
         * @name module:services/datacontext#log
         * @private
         * @function
         * @param {string} msg - The message to be displayed in the toast.
         * @param {Object} data - The data to be logged when the toast is displayed.
         * @param {boolean} showToast - Whether to make the toast visible on the screen.
         */
        function logError(msg, data, showToast) {
            logger.logError(msg, data, system.getModuleId(datacontext), showToast);
        }

        var datacontext = {
            saveChanges: saveChanges,
            rejectChanges: rejectChanges,
            hasChanges: hasChanges,

            primeData: primeData,

            getUsers: getUsers,
            getHouses: getHouses,
            getConversations: getConversations,
            getLoggedInUser: getLoggedInUser,
            getUsersJoinRequest: getUsersJoinRequest,

            getBillTypesByHouse: getBillTypesByHouse,
            getUsersByHouse: getUsersByHouse,
            getPendingRequestsByHouse: getPendingRequestsByHouse,
            getBinRotasByHouse: getBinRotasByHouse,
            getCleaningRotasByHouse: getCleaningRotasByHouse,
            getConversationsByHouse: getConversationsByHouse,
            getAnnouncementsByHouse: getAnnouncementsByHouse,
            getWishListItemsByHouse: getWishListItemsByHouse,
            getActivitiyLogsByHouse: getActivitiyLogsByHouse,

            getUserById: getUserById,
            getBillTypeById: getBillTypeById,
            getInvoiceById: getInvoiceById,

            requestHouseJoin: requestHouseJoin,
            joinTenantToHouse: joinTenantToHouse,

            deleteInvoice: deleteInvoice,
            
            login: login,
            facebookLogin: facebookLogin,
            logout: logout,
            register: register,
            changePassword: changePassword,
            changeEmail: changeEmail,

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
            createAnnouncement: createAnnouncement,
            createWishListItem: createWishListItem,

            uploadFacebookPicture: uploadFacebookPicture,
            uploadUrlPicture: uploadUrlPicture,
            uploadFilePicture: uploadFilePicture
        };

        return datacontext;
    });