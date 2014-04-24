using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json.Linq;
using Breeze.WebApi;
using Breeze.WebApi.EF;

namespace TenantOrganiser.Controllers
{
    [BreezeController]
    public class BreezeController : ApiController
    {
        private TenantOrganiserContextProvider  _contextProvider =
            new TenantOrganiserContextProvider();

        [HttpGet]
        public string Metadata()
        {
            return _contextProvider.Metadata();
        }

        [HttpPost]
        [Authorize]
        public SaveResult SaveChanges(JObject saveBundle)
        {
            return _contextProvider.SaveChanges(saveBundle);
        }

        [HttpGet]
        [Authorize]
        public IQueryable<ActivityLog> ActivityLogs()
        {
            return _contextProvider.Context.ActivityLogs;
        }

        [HttpGet]
        public IQueryable<BillType> BillTypes()
        {
            return _contextProvider.Context.BillTypes;
        }

        [HttpGet]
        public IQueryable<BinRota> BinRotas()
        {
            return _contextProvider.Context.BinRotas;
        }

        [HttpGet]
        public IQueryable<CleaningLog> CleaningLogs()
        {
            return _contextProvider.Context.CleaningLogs;
        }

        [HttpGet]
        public IQueryable<CleaningRota> CleaningRotas()
        {
            return _contextProvider.Context.CleaningRotas;
        }

        [HttpGet]
        public IQueryable<CommunalMessage> CommunalMessages()
        {
            return _contextProvider.Context.CommunalMessages;
        }

        [HttpGet]
        public IQueryable<Conversation> Conversations()
        {
            return _contextProvider.Context.Conversations;
        }

        [HttpGet]
        public IQueryable<ConversationUser> ConversationUsers()
        {
            return _contextProvider.Context.ConversationUsers;
        }

        [HttpGet]
        public IQueryable<Message> Messages()
        {
            return _contextProvider.Context.Messages;
        }

        [HttpGet]
        public IQueryable<House> Houses()
        {
            return _contextProvider.Context.Houses;
        }

        [HttpGet]
        public IQueryable<HouseJoinRequest> HouseJoinRequests()
        {
            return _contextProvider.Context.HouseJoinRequests;
        }

        [HttpGet]
        public IQueryable<User> Users()
        {
            return _contextProvider.Context.Users;
        }

        [HttpGet]
        public IQueryable<WishListItem> WishListItems()
        {
            return _contextProvider.Context.WishListItems;
        }

   }
}