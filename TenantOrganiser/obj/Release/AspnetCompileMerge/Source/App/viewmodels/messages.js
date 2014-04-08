define(['services/logger', 'services/datacontext', 'services/session'],
    function (logger, datacontext, session) {

        var tenantsList = new ko.observableArray();
        var conversationsList = new ko.observableArray();

        var activeConversation = new ko.observable();

        var composingMessage = new ko.observable();

        var vm = {
            activate: activate,
            title: 'Messages',

            attached: viewAttached,

            tenantsList: tenantsList,
            conversationsList: conversationsList,
            activeConversation: activeConversation,
            conversationClicked: conversationClicked,

            recipientAdded: recipientAdded,
            recipientRemoved: recipientRemoved,

            composingMessage: composingMessage,
            messageSent: messageSent,

            newConvoClicked: newConvoClicked
        };

        return vm;


        function activate() {

            datacontext.getTenants(tenantsList, session.sessionUser().HouseId());
            datacontext.getConversations(conversationsList, session.sessionUser().HouseId());

            logger.log('Messages View Activated', null, 'messages', true);

            return true;
        }

        function viewAttached() { }

        function removeRecipsFromTenantsList() {

            console.log(activeConversation());

            $.each(tenantsList(), function (i, tenant) {
                $.each(activeConversation().ConversationUsers(), function (j, convoUser) {
                    
                    if (convoUser.UserId() === tenant.Id()) {
                        console.log(tenant);
                        tenantsList.remove(tenant);
                        return true;
                    }
                });
            });
        }

        function newConvoClicked() {

            var conv = new Conversation(new ko.observableArray(), new ko.observableArray([{ Name: 'Adam', ProfilePicUrl: '../../Content/images/profile-picture.jpg' }]));

            conversationsList.push(conv);

            conversationClicked(conv);
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

                return datacontext.saveChanges().then(messageSaved);

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

        function recipientRemoved(data) {

            activeConversation().recipients.remove(data);
        }

        function generateRecipientsString(myString) {

            return 'Hello: ' + myString;
        }

        function recipientAdded(data) {

            var convoUser = datacontext.createConversationUser(activeConversation(), data);

            datacontext.saveChanges();
        }

        function getTenantsList() {

            var list = new ko.observableArray();

            list.push({ Name: 'Adam Barrell', ProfilePicUrl: '../../Content/images/profile-picture.jpg' });
            list.push({ Name: 'Chris Lewis', ProfilePicUrl: '../../Content/images/profile-picture-2.jpg' });
            list.push({ Name: 'Toby Webster', ProfilePicUrl: '../../Content/images/profile-picture-3.jpg' });
            list.push({ Name: 'Tom Walton', ProfilePicUrl: '../../Content/images/profile-picture-2.jpg' });
            list.push({ Name: 'Hannah Marriott', ProfilePicUrl: '../../Content/images/profile-picture.jpg' });
            list.push({ Name: 'Joss Whittle', ProfilePicUrl: '../../Content/images/profile-picture-3.jpg' });

            return list;
        }

    });