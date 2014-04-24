/*jslint browser: true*/
/*global define, ko, requirejs, $, ko, Q*/

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


        function activate(recipId) {
            return Q.all([refreshTenants(), refreshConversations()]).then(function () {

                if (recipId) {
                    recipientParam(recipId);
                }

                logger.log('Messages View Activated', null, 'messages', true);
            });
        }

        function attached() {
            if (recipientParam()) {
                var recip = $.grep(tenantsList(), function (tenant, i) {
                    console.log("Tenant Id: " + tenant.Id() + " / Param Id: " + recipientParam());
                    console.log(tenant.Id() === parseInt(recipientParam()));
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

        function refreshTenants() {
            return datacontext.getTenants(tenantsList, session.sessionUser().HouseId());
        }

        function refreshConversations() {
            return datacontext.getConversationsByHouse(conversationsList, session.sessionUser().HouseId()).then(filterConversations);
        }

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

        function checkEnterKeyPressed(event) {

            var keycode = (event.keyCode ? event.keyCode : event.which);

            if (keycode == '13') {
                messageSent();
            }
        }

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

        function scrollChatBox() {
            // Scroll the chat view pane to the bottom to show most recent message
            $("#convo-panel").off('scrollTop');
            $("#convo-panel").scrollTop($("#convo-panel")[0].scrollHeight);
        }

        function conversationClicked(data) {
            // Reset active conversation
            activeConversation(null);
            activeConversation(data);

            removeRecipsFromTenantsList();

            composingMessage('');

            $('#message-box').focus();
            // Clean up keypress events bound from other conversations
            $('#message-box').off('keypress');
            $('#message-box').keypress(checkEnterKeyPressed);

            scrollChatBox();
        }

        function recipientAdded(data) {
            var convoUser = datacontext.createConversationUser(activeConversation(), data);

            return datacontext.saveChanges().then(function () {
                removeRecipsFromTenantsList();
            });
        }

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