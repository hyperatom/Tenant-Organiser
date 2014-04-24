using Breeze.WebApi;
using Breeze.WebApi.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TenantOrganiser.Controllers
{
    public class TenantOrganiserContextProvider : EFContextProvider<TenantOrganiserDbContext>
    {
        public TenantOrganiserContextProvider() : base() { }

        protected override bool BeforeSaveEntity(EntityInfo entityInfo)
        {
            if (entityInfo.Entity.GetType() == typeof(WishListItem))
            {
                if (entityInfo.EntityState == EntityState.Added)
                {
                    WishListItem item = (WishListItem)entityInfo.Entity;
                    ActivityLog log = new ActivityLog { LogName = Log.WISH_LIST, UserId = item.UserAddedId, HouseId = item.HouseId, ActionMessage = "Added a " + item.ItemName + " to the wish list." };
                    Context.ActivityLogs.Add(log);
                }

                if (entityInfo.EntityState == EntityState.Modified)
                {
                    WishListItem item = (WishListItem)entityInfo.Entity;
                    var original = entityInfo.OriginalValuesMap;

                    // If the item has had a new user added that acquired it
                    if (original.ContainsKey("UserAcquiredId") && item.UserAcquiredId != null)
                    {
                        ActivityLog log = new ActivityLog { LogName = Log.WISH_LIST, UserId = item.UserAcquiredId, HouseId = item.HouseId, ActionMessage = "Purchased " + item.ItemName + " from the wish list." };
                        Context.ActivityLogs.Add(log);
                    }
                }
            }

            if (entityInfo.Entity.GetType() == typeof(HouseJoinRequest))
            {
                if (entityInfo.EntityState == EntityState.Added)
                {
                    HouseJoinRequest item = (HouseJoinRequest)entityInfo.Entity;
                    ActivityLog log = new ActivityLog { LogName = Log.TENANT, UserId = item.UserId, HouseId = item.HouseId, ActionMessage = "Requested to join this house." };
                    Context.ActivityLogs.Add(log);

                    User reqUser = Context.Users.Where(p => p.Id == item.UserId).SingleOrDefault();
                    House reqHouse = Context.Houses.Where(p => p.Id == item.HouseId).SingleOrDefault();

                    List<User> houseUsers = Context.Users.Where(u => u.EmailNotifications == true && u.HouseId == item.HouseId).ToList();

                    foreach (User user in houseUsers)
                    {
                        Mailer mailer = new Mailer(user.Email);

                        mailer.Body = reqUser.FirstName + " " + reqUser.LastName + " has requested to join " +
                        reqHouse.HouseName + ". Please review this request from your account settings panel at " + "http://tenantorganiser.com/#account-settings.";
                        mailer.Subject = "House Join Request";
                        mailer.Send();
                    }

                }
            }

            if (entityInfo.Entity.GetType() == typeof(User))
            {
                User item = (User)entityInfo.Entity;
                var original = entityInfo.OriginalValuesMap;

                if (entityInfo.EntityState == EntityState.Modified)
                {
                    if (original.ContainsKey("HouseId") && item.HouseId != null)
                    {
                        ActivityLog log = new ActivityLog { LogName = Log.TENANT, UserId = item.Id, HouseId = (int)item.HouseId, ActionMessage = "Joined this house." };
                        Context.ActivityLogs.Add(log);
                    }

                    if (original.ContainsKey("HouseId") && item.HouseId == null)
                    {
                        ActivityLog log = new ActivityLog { LogName = Log.TENANT, UserId = item.Id, HouseId = (int)item.HouseId, ActionMessage = "Left this house." };
                        Context.ActivityLogs.Add(log);
                    }
                }
            }

            if (entityInfo.Entity.GetType() == typeof(BillInvoice))
            {
                BillInvoice item = (BillInvoice)entityInfo.Entity;
                var original = entityInfo.OriginalValuesMap;

                string typeName = Context.BillTypes.Where(i => i.Id == item.BillTypeId).Select(p => p.Name).SingleOrDefault();

                int managerId = Context.BillTypes.Where(i => i.Id == item.BillTypeId).Select(p => p.ManagerId).SingleOrDefault();
                int houseId = (int)Context.BillTypes.Where(i => i.Id == item.BillTypeId).Select(p => p.Manager.HouseId).SingleOrDefault();

                if (entityInfo.EntityState == EntityState.Added)
                {
                    ActivityLog log = new ActivityLog { LogName = Log.BILL, UserId = managerId, HouseId = houseId, ActionMessage = "Added a new " + typeName + " invoice." };
                    Context.ActivityLogs.Add(log);
                }
            }

            if (entityInfo.Entity.GetType() == typeof(InvoiceRecipient))
            {
                InvoiceRecipient item = (InvoiceRecipient)entityInfo.Entity;
                var original = entityInfo.OriginalValuesMap;

                BillInvoice invoice = Context.BillInvoices.Where(p => p.Id == item.BillInvoiceId).SingleOrDefault();
                BillType billType = Context.BillTypes.Where(p => p.Id == invoice.BillTypeId).SingleOrDefault();

                int houseId = (int)Context.Users.Where(u => u.Id == item.UserId).Select(s => s.HouseId).SingleOrDefault();

                User billManager = Context.Users.Where(p => p.Id == billType.ManagerId).SingleOrDefault();
                User user = Context.Users.Where(p => p.Id == item.UserId).SingleOrDefault();

                if (entityInfo.EntityState == EntityState.Added)
                {
                    if (user.EmailNotifications)
                    {
                        Mailer mailer = new Mailer(user.Email);
                        mailer.Subject = "New " + billType.Name + " Invoice";
                        mailer.Body = "You have been assigned a new " + billType.Name +
                            " invoice of £" + item.Amount + " to be payed to " + billManager.FirstName +
                            " " + billManager.LastName + " by " + invoice.DueDate.ToLongDateString() + ".";
                        mailer.Send();
                    }
                }

                if (entityInfo.EntityState == EntityState.Modified)
                {
                    if (original.ContainsKey("Paid") && item.Paid == true)
                    {
                        ActivityLog log = new ActivityLog { LogName = Log.BILL, UserId = item.UserId, HouseId = houseId, ActionMessage = "Paid a " + billType.Name + " invoice." };
                        Context.ActivityLogs.Add(log);
                    }
                }
            }

            if (entityInfo.Entity.GetType() == typeof(CleaningLog))
            {
                CleaningLog item = (CleaningLog)entityInfo.Entity;
                var original = entityInfo.OriginalValuesMap;

                if (entityInfo.EntityState == EntityState.Added)
                {
                    CleaningRota rota = Context.CleaningRotas.Where(p => p.Id == item.CleaningRotaId).SingleOrDefault();

                    // Find the first user settings which is part of the rota group
                    UserSettings setting = Context.UserSettings.Where(p => p.CleaningRotaGroup == item.RotaGroup).FirstOrDefault();
                    // Link the first found user settings with a user who is part of the group
                    User user = Context.Users.Where(u => u.UserSettingsId == setting.Id).SingleOrDefault();

                    ActivityLog log = new ActivityLog { LogName = Log.CLEANING_ROTA, UserId = user.Id, HouseId = (int)user.HouseId, ActionMessage = "Cleaned the " + rota.Name + "." };
                    Context.ActivityLogs.Add(log);
                }
            }

            if (entityInfo.Entity.GetType() == typeof(Message))
            {
                Message item = (Message)entityInfo.Entity;
                var original = entityInfo.OriginalValuesMap;

                if (entityInfo.EntityState == EntityState.Added)
                {
                    // Send emails to all conversation recipients
                    List<ConversationUser> convoUsers = Context.ConversationUsers.Where(p => p.ConversationId == item.ConversationId).ToList();

                    User sender = Context.Users.Where(p => p.Id == item.UserId).SingleOrDefault();

                    foreach (ConversationUser u in convoUsers)
                    {
                        User user = Context.Users.Where(p => p.Id == u.UserId).SingleOrDefault();

                        if (user.EmailNotifications && sender.Id != u.UserId)
                        {
                            Mailer mailer = new Mailer(user.Email);
                            mailer.Subject = "New Message";
                            mailer.Body =
                                "You have received a new message from " +
                                sender.FirstName + " " + sender.LastName +
                                ". View the full conversation at http://tenantorganiser.com/#messages. \r\n\r\n"
                                + item.Content;
                            mailer.Send();
                        }
                    }
                }
            }

            if (entityInfo.Entity.GetType() == typeof(CommunalMessage))
            {
                CommunalMessage item = (CommunalMessage)entityInfo.Entity;
                var original = entityInfo.OriginalValuesMap;

                if (entityInfo.EntityState == EntityState.Added)
                {
                    var sender = Context.Users.Where(p => p.Id == item.UserId);
                    User senderUser = sender.SingleOrDefault();

                    // Send emails to all house users except for one who sent it
                    List<User> users = Context.Users.Where(p => p.HouseId == senderUser.HouseId).Except(sender).ToList();

                    foreach (User u in users)
                    {
                        if (u.EmailNotifications)
                        {
                            Mailer mailer = new Mailer(u.Email);
                            mailer.Subject = "Communal Announcement";
                            mailer.Body =
                                "A communal announcement was added by " +
                                senderUser.FirstName + " " + senderUser.LastName + ".\r\n\r\n" +
                                item.Content;
                            mailer.Send();
                        }
                    }
                }
            }

            if (entityInfo.Entity.GetType() == typeof(Conversation))
            {
                Conversation item = (Conversation)entityInfo.Entity;
                var original = entityInfo.OriginalValuesMap;

                if (entityInfo.EntityState == EntityState.Deleted)
                {
                    List<ConversationUser> users = Context.ConversationUsers.Where(p => p.ConversationId == item.Id).ToList();
                    
                    // If theres only one user left
                    if (users.Count() == 1)
                    {
                        List<Message> messages = Context.Messages.Where(m => m.ConversationId == item.Id).ToList();
                        
                        foreach (Message m in messages)
                        {
                            Context.Messages.Remove(m);
                        }
                    }
                }
            }

            if (entityInfo.Entity.GetType() == typeof(UserSettings))
            {
                UserSettings item = (UserSettings)entityInfo.Entity;
                var original = entityInfo.OriginalValuesMap;

                if (entityInfo.EntityState == EntityState.Modified)
                {
                    /*if (original["CleaningRotaGroup"] != null && item.CleaningRotaGroup == null)
                    {
                        int originalGroup = Int32.Parse(original["CleaningRotaGroup"].ToString());
                        User user = Context.Users.Where(u => u.UserSettingsId == item.Id).SingleOrDefault();
                        
                        // If there are no other users in the SAME house with the SAME group then refresh cleaning logs for that house

                        List<UserSettings> settings = Context.UserSettings.Where(p => p.CleaningRotaGroup == originalGroup).ToList();
                        List<int> tenantIds = Context.Users.Where(p => p.HouseId == user.HouseId).Select(s => s.Id).ToList();

                        int groupUsers = settings.Where(p => tenantIds.Contains(p.Id)).Count();

                        if (groupUsers-1 == 0)
                        {
                            List<CleaningLog> logs = Context.CleaningLogs.ToList();

                            foreach (CleaningLog l in logs)
                            {
                                Context.CleaningLogs.Remove(l);
                            }
                        }
                    }*/
                }
            }

            return true;
        }

        protected override Dictionary<Type, List<EntityInfo>> BeforeSaveEntities(Dictionary<Type, List<EntityInfo>> saveMap)
        {
            // return a map of those entities we want saved.
            return saveMap;
        }
    }


}