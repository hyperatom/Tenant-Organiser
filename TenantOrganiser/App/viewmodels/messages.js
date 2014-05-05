/*jslint browser: true*/
/*global define, ko, requirejs, $, ko, Q*/

/**
 * View model for the Messages view.
 * Performs tasks associated with sending and receiving chat messages.
 * 
 * @module viewmodels/messages
 */
define(['services/logger', 'services/datacontext', 'services/session'],

    function (logger, datacontext, session) {

        var recipientParam = new ko.observable();

        var tenantsList = new ko.observableArray();
        var conversationsList = new ko.observableArray();
        var activeConversation = new ko.observable();
        var composingMessage = new ko.observable();

        var vm = {
            activate: activate,
            attached: attached,
            title: 'Messages',

            tenantsList: tenantsList,
            conversationsList: conversationsList,
            activeConversation: activeConversation,
            conversationClicked: conversationClicked,
            createNewConversation: createNewConversation,
            leaveConversation: leaveConversation,

            recipientAdded: recipientAdded,

            composingMessage: composingMessage,
            messageSent: messageSent
        };

        return vm;


        /** 
        * Activates the view model by initialising required data.
        * Adds a user to a new conversation if specified.
        * 
        * @name module:viewmodels/messages#activate
        * @public
        * @function
        * @param {number} recipId - Id of the recipient to add to a new conversation.
        * @returns {Object} Promise returned when all data has been primed.
        */
        function activate(recipId) {
            return Q.all([refreshTenants(), refreshConversations()]).then(function () {
                recipId ? recipientParam(recipId) : null;
                logger.log('Messages View Activated', null, 'messages', true);
            });
        }

        /** 
        * Called when a view is attached to this view model.
        * Retrieves the user object using the specified Id passed into activate().
        * 
        * @name module:viewmodels/messages#attached
        * @public
        * @function
        */
        function attached() {
            if (recipientParam()) {
                var recip = $.grep(tenantsList(), function (tenant, i) {
                    return tenant.Id() === parseInt(recipientParam());
                });

                if (parseInt(recipientParam()) === session.sessionUser().Id())
                    return createNewConversation();

                createNewConversation().then(function () {
                    recipientAdded(recip[0]);
                    recipientParam(null);
                });
            } else if (conversationsList().length > 0) {
                conversationClicked(conversationsList()[0]);
            }
        }

        /** 
        * Refreshes the list of tenants associated with the session user's house.
        * 
        * @name module:viewmodels/messages#refreshTenants
        * @private
        * @function
        * @returns {Object} Promise returned when the tenants are retrieved.
        */
        function refreshTenants() {
            return datacontext.getUsersByHouse(tenantsList, session.sessionUser().HouseId());
        }

        /** 
        * Refreshes the list of conversations associated with the session user.
        * 
        * @name module:viewmodels/messages#refreshConversations
        * @private
        * @function
        * @returns {Object} Promise returned when the conversations are retrieved.
        */
        function refreshConversations() {
            return datacontext.getConversationsByHouse(conversationsList, session.sessionUser().HouseId()).then(filterConversations);
        }

        /** 
        * Excludes any conversations that the user is not a part of.
        * 
        * @name module:viewmodels/messages#filterConversations
        * @private
        * @function
        */
        function filterConversations() {
            // Only include conversations the session user is in
            conversationsList(conversationsList().filter(isSessionUserIncluded));

            function isSessionUserIncluded(conversation) {

                // Check if user is a part of the conversation
                var results = $.grep(conversation.ConversationUsers(), isSessionUser);

                function isSessionUser(convoUser) {
                    return convoUser.UserId() === session.sessionUser().Id();
                }

                // If the session user was part of the conversation return true
                return results.length > 0;
            }
        }

        /** 
        * Removes users from the tenants list who area already recipients of the active conversation.
        * This prevents users from being added twice to the same conversation.
        * 
        * @name module:viewmodels/messages#removeRecipsFromTenantsList
        * @private
        * @function
        */
        function removeRecipsFromTenantsList() {

            return refreshTenants().then(function () {
                // Remove all tenants who are already recipients of convo
                tenantsList(tenantsList().filter(filterTenants));
            });

            function filterTenants(tenant) {
                var results = $.grep(activeConversation().ConversationUsers(), isTenantRecipient);

                function isTenantRecipient(convoUser) {
                    return convoUser.UserId() === tenant.Id();
                }
                
                // If user is not in the active convo, include them in tenants list
                return results.length === 0;
            }
        }

        /** 
        * Sends the message currently being composed if the enter key is pressed.
        * 
        * @name module:viewmodels/messages#filterConversations
        * @private
        * @function
        * @param {Object} event - Keypress event.
        */
        function checkEnterKeyPressed(event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            keycode == '13' ? messageSent() : null;
        }

        /** 
        * Send the composed message to the specified recipients.
        * 
        * @name module:viewmodels/messages#messageSent
        * @public
        * @function
        * @returns {Object} Promise returned when the message is sent.
        */
        function messageSent() {
            if (composingMessage()) {
                var msg = datacontext.createMessage(),
                    newMessage = composingMessage();

                msg.Content(newMessage);
                msg.Conversation(activeConversation());
                msg.UserSent(session.sessionUser());

                return datacontext.saveChanges().then(messageSaved).then(refreshConversations);

                function messageSaved() {
                    // Refresh chat box to show sent message
                    conversationClicked(activeConversation());
                }
            }
        }

        /** 
        * Scrolls the chat box to the bottom each time a message is sent to
        * ensure the most recent messages can be viewed.
        * 
        * @name module:viewmodels/messages#scrollChatBox
        * @private
        * @function
        */
        function scrollChatBox() {
            // Scroll the chat view pane to the bottom to show most recent message
            $("#convo-panel").off('scrollTop');
            $("#convo-panel").scrollTop($("#convo-panel")[0].scrollHeight);
        }

        /** 
        * Sets the conversation being viewed to the specified conversation.
        * 
        * @name module:viewmodels/messages#conversationClicked
        * @public
        * @function
        * @param {Object} selectedConvo - Conversation selected for viewing.
        */
        function conversationClicked(selectedConvo) {
            // Reset active conversation
            activeConversation(null);
            activeConversation(selectedConvo);

            removeRecipsFromTenantsList();

            composingMessage('');

            $('#message-box').focus();
            // Clean up keypress events bound from other conversations
            $('#message-box').off('keypress');
            $('#message-box').keypress(checkEnterKeyPressed);

            scrollChatBox();
        }

        /** 
        * Adds the specified recipient to the conversation being viewed.
        * 
        * @name module:viewmodels/messages#recipientAdded
        * @public
        * @function
        * @param {Object} recipient - Recipient to be added to the current conversation.
        */
        function recipientAdded(recipient) {
            var convoUser = datacontext.createConversationUser(activeConversation(), recipient);

            return datacontext.saveChanges().then(function () {
                removeRecipsFromTenantsList();
            });
        }

        /** 
        * Creates a new conversation containing only the session user as a recipient.
        * 
        * @name module:viewmodels/messages#recipientAdded
        * @public
        * @function
        * @returns {Object} Promise returned when the new conversation has been created.
        */
        function createNewConversation() {
            var newConvo = datacontext.createConversation(session.sessionUser);
            newConvo.DateStarted(moment().toString());
            datacontext.createConversationUser(newConvo, session.sessionUser());

            function showCreatedConvo() {
                conversationClicked(newConvo);
            }

            return datacontext.saveChanges().then(function() {
                return refreshConversations().then(function () {
                    return showCreatedConvo();
                });
            });
        }

        /** 
        * Removes the session user from the conversation currently being viewed.
        * 
        * @name module:viewmodels/messages#leaveConversation
        * @public
        * @function
        * @returns {Object} Promise returned when the session user has been removed from the conversation.
        */
        function leaveConversation() {
            // Get the convo user which the session user is part of
            var results = $.grep(activeConversation().ConversationUsers(), isSessionUser);

            function isSessionUser(convoUser) {
                return convoUser.UserId() === session.sessionUser().Id();
            }

            var convo = activeConversation();
            activeConversation(null);

            // If session user was the only one left, delete convo
            if (convo.ConversationUsers().length === 1) {
                // Remove all messages associated with the conversation
                if (convo.Messages().length > 0) {
                    $.each(convo.Messages().slice(), deleteMessage)

                    function deleteMessage(i, msg) {
                        msg.entityAspect.setDeleted();
                    }
                }

                convo.entityAspect.setDeleted();
            } else {
                convo.ConversationUsers.remove(results[0]);
            }

            results[0].entityAspect.setDeleted();

            return datacontext.saveChanges().then(refreshConversations);
        }
    });