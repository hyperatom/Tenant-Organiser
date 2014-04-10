using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace TenantOrganiser
{
    /// <summary>
    /// This class initialises all database tables with test data.
    /// </summary>
    public class TenantOrganiserDbInitialiser : DropCreateDatabaseAlways<TenantOrganiserDbContext>
    {
        /// <summary>
        /// Seeds the database tables with test data.
        /// </summary>
        /// <param name="context">Context of the database.</param>
        protected override void Seed(TenantOrganiserDbContext context)
        {
            InitHouses(context);
            InitUsers(context);
            InitHouseRequests(context);

            InitWishListItems(context);
            //InitConversations(context);

            InitBillTypes(context);
            InitBillInvoices(context);
            InitInvoiceRecipients(context);

            InitCommunalAreas(context);
            InitCleaningRotas(context);
            InitCleaningLogs(context);
            InitBinRotas(context);

            InitCommunalMessages(context);

            InitActivityLogs(context);

            base.Seed(context);
        }

        /// <summary>
        /// Adds houses to the database context.
        /// </summary>
        /// <param name="context">Context of the database.</param>
        private void InitHouses(TenantOrganiserDbContext context)
        {
            IList<House> houses = new List<House>();

            houses.Add(new House() { HouseName = "51 King Edwards Road", HouseCode = "51KER" });
            houses.Add(new House() { HouseName = "22 Ferrara Square", HouseCode = "22FSQ" });
            houses.Add(new House() { HouseName = "9 Saffron Drive", HouseCode = "9SAFD" });

            foreach (House h in houses)
                context.Houses.Add(h);

            context.SaveChanges();
        }

        /// <summary>
        /// Adds users to the database context.
        /// </summary>
        /// <param name="context">Context of the database.</param>
        private void InitUsers(TenantOrganiserDbContext context)
        {
            IList<User> users = new List<User>();

            // Get 51 King Edwards Road house
            House ker = context.Houses.Where(h => h.HouseCode == "51KER").SingleOrDefault();

            // User to request to join house
            users.Add(new User() { FirstName = "Chris", LastName = "Lewis", Password = "password", Email = "chris.lewis@gmail.com", DisplayPictureFileName = "profile-picture.jpg" });

            // Create users and attach the house
            users.Add(new User() { FirstName = "Tom", LastName = "Milner", Password = "password", Email = "tom.milner@gmail.com", DisplayPictureFileName = "profile-picture.jpg", House = ker });
            users.Add(new User() { FirstName = "Tom", LastName = "Walton", Password = "password", Email = "tom.walton@gmail.com", DisplayPictureFileName = "profile-picture-2.jpg", House = ker });
            users.Add(new User() { FirstName = "Joss", LastName = "Whittle", Password = "password", Email = "joss.whittle@gmail.com", DisplayPictureFileName = "profile-picture-3.jpg", House = ker });
            users.Add(new User() { FirstName = "Toby", LastName = "Webster", Password = "password", Email = "toby.webster@gmail.com", DisplayPictureFileName = "profile-picture.jpg", House = ker });
            users.Add(new User() { FirstName = "Hannah", LastName = "Marriott", Password = "password", Email = "hannah.marriott@gmail.com", DisplayPictureFileName = "profile-picture-2.jpg", House = ker });

            // Add created users to the context
            foreach (User u in users)
            {
                u.UserSettings = new UserSettings() { EmailNotifications = true };
                context.Users.Add(u);
            }

            context.SaveChanges();
        }

        private void InitHouseRequests(TenantOrganiserDbContext context)
        {
            User user = context.Users.Where(u => u.FirstName == "Chris").SingleOrDefault();
            House house = context.Houses.Where(h => h.HouseCode == "51KER").SingleOrDefault();

            context.HouseJoinRequests.Add(new HouseJoinRequest { User = user, House = house });

            context.SaveChanges();
        }

        private void InitWishListItems(TenantOrganiserDbContext context)
        {
            IList<WishListItem> items = new List<WishListItem>();

            House ke = context.Houses.Where(h => h.HouseCode == "51KER").SingleOrDefault();

            User chris = context.Users.Where(u => u.FirstName == "Chris").SingleOrDefault();
            User toby = context.Users.Where(u => u.FirstName == "Toby").SingleOrDefault();

            items.Add(new WishListItem { ItemName = "Wooden Spoon", UserAdded = chris, House = ke });
            items.Add(new WishListItem { ItemName = "Table Cloth", UserAdded = chris, AquiredOn = DateTime.Now, UserAcquired = toby, House = ke });
            items.Add(new WishListItem { ItemName = "Dish-o-Matic Heads", UserAdded = chris, House = ke });
            items.Add(new WishListItem { ItemName = "Wooden Spoon", UserAdded = chris, House = ke });

            foreach (WishListItem i in items)
            {
                context.WishListItems.Add(i);
            }

            context.SaveChanges();
        }

        private void InitConversations(TenantOrganiserDbContext context)
        {
            User chris = context.Users.Where(u => u.FirstName == "Chris").SingleOrDefault();
            User toby = context.Users.Where(u => u.FirstName == "Toby").SingleOrDefault();

            Conversation convo = new Conversation();

            ConversationUser convoUserChris = new ConversationUser { User = chris };
            ConversationUser convoUserToby = new ConversationUser { User = toby };

            Message msg1 = new Message { Content = "Hey toby", DateSent = DateTime.Now, UserSent = chris };
            Message msg2 = new Message { Content = "Hey chris", DateSent = DateTime.Now, UserSent = toby };

            convo.ConversationUsers.Add(convoUserChris);
            convo.ConversationUsers.Add(convoUserToby);
            convo.Messages.Add(msg1);
            convo.Messages.Add(msg2);

            context.Conversations.Add(convo);

            context.SaveChanges();
        }

        private void InitBillTypes(TenantOrganiserDbContext context)
        {
            User hannah = context.Users.Where(u => u.LastName == "Marriott").SingleOrDefault();
            User toby = context.Users.Where(u => u.FirstName == "Toby").SingleOrDefault();
            User tom = context.Users.Where(u => u.FirstName == "Hannah").Single();

            context.BillTypes.Add(new BillType { Name = "Water Bill", Manager = hannah });
            context.BillTypes.Add(new BillType { Name = "Gas Bill", Manager = toby });
            context.BillTypes.Add(new BillType { Name = "Internet Bill", Manager = tom });

            context.SaveChanges();
        }

        private void InitBillInvoices(TenantOrganiserDbContext context)
        {
            User tom = context.Users.Where(u => u.LastName == "Walton").SingleOrDefault();
            User toby = context.Users.Where(u => u.LastName == "Webster").SingleOrDefault();
            User hannah = context.Users.Where(u => u.LastName == "Marriott").SingleOrDefault();

            BillType water = context.BillTypes.Where(b => b.Name == "Water Bill").SingleOrDefault();
            BillType gas = context.BillTypes.Where(b => b.Name == "Gas Bill").SingleOrDefault();
            BillType internet = context.BillTypes.Where(b => b.Name == "Internet Bill").SingleOrDefault();

            BillInvoice waterInvoice1 = new BillInvoice { BillType = water, DueDate = DateTime.Parse("20/04/2014") };
            BillInvoice waterInvoice2 = new BillInvoice { BillType = water, DueDate = DateTime.Parse("11/05/2014") };
            BillInvoice gasInvoice1 = new BillInvoice { BillType = gas, DueDate = DateTime.Parse("05/06/2014") };
            BillInvoice internetInvoice = new BillInvoice { BillType = internet, DueDate = DateTime.Parse("05/06/2013") };

            context.BillInvoices.Add(waterInvoice1);
            context.BillInvoices.Add(waterInvoice2);
            context.BillInvoices.Add(gasInvoice1);
            context.BillInvoices.Add(internetInvoice);

            context.SaveChanges();
        }

        private void InitInvoiceRecipients(TenantOrganiserDbContext context)
        {
            User tom = context.Users.Where(u => u.LastName == "Walton").SingleOrDefault();
            User toby = context.Users.Where(u => u.LastName == "Webster").SingleOrDefault();
            User hannah = context.Users.Where(u => u.LastName == "Marriott").SingleOrDefault();

            BillInvoice waterInvoice = context.BillInvoices.Where(b => b.BillType.Name == "Water Bill").First();
            BillInvoice gasInvoice = context.BillInvoices.Where(b => b.BillType.Name == "Gas Bill").First();
            BillInvoice internetInvoice = context.BillInvoices.Where(b => b.BillType.Name == "Internet Bill").First();

            context.InvoiceRecipients.Add(new InvoiceRecipient { User = tom, BillInvoice = waterInvoice, Amount = 10.65, Paid = false });
            context.InvoiceRecipients.Add(new InvoiceRecipient { User = toby, BillInvoice = waterInvoice, Amount = 22.05, Paid = true });
            context.InvoiceRecipients.Add(new InvoiceRecipient { User = hannah, BillInvoice = gasInvoice, Amount = 35.90, Paid = false });
            context.InvoiceRecipients.Add(new InvoiceRecipient { User = toby, BillInvoice = gasInvoice, Amount = 44, Paid = true });
            context.InvoiceRecipients.Add(new InvoiceRecipient { User = toby, BillInvoice = internetInvoice, Amount = 44, Paid = true });

            context.SaveChanges();
        }

        private void InitCommunalAreas(TenantOrganiserDbContext context)
        {
            House kingEd = context.Houses.Where(h => h.HouseCode == "51KER").SingleOrDefault();

            CommunalArea kitchen = new CommunalArea { Name = "Kitchen", House = kingEd };
            CommunalArea bathroom = new CommunalArea { Name = "Bathroom", House = kingEd };
            CommunalArea floors = new CommunalArea { Name = "Floors", House = kingEd };
            CommunalArea livingRoom = new CommunalArea { Name = "Living Room", House = kingEd };

            context.CommunalAreas.Add(kitchen);
            context.CommunalAreas.Add(bathroom);
            context.CommunalAreas.Add(floors);
            context.CommunalAreas.Add(livingRoom);

            context.SaveChanges();
        }

        private void InitCleaningRotas(TenantOrganiserDbContext context)
        {
            CommunalArea kitchen = context.CommunalAreas.Where(a => a.Name == "Kitchen").SingleOrDefault();

            kitchen.CleaningRota = new CleaningRota { StartDate = DateTime.Parse("26/03/2013"), FrequencyDays = 4};

            context.SaveChanges();
        }

        private void InitCleaningLogs(TenantOrganiserDbContext context)
        {
            User toby = context.Users.Where(u => u.FirstName == "Toby").SingleOrDefault();
            User tom = context.Users.Where(u => u.LastName == "Walton").SingleOrDefault();

            CommunalArea kitchen = context.CommunalAreas.Where(a => a.Name == "Kitchen").SingleOrDefault();

            context.CleaningLogs.Add(new CleaningLog { Date = DateTime.Parse("11/05/2014"), CommunalArea = kitchen, User = toby });
            context.CleaningLogs.Add(new CleaningLog { Date = DateTime.Parse("11/05/2014"), CommunalArea = kitchen, User = tom });

            context.SaveChanges();
        }

        private void InitCommunalMessages(TenantOrganiserDbContext context)
        {
            House ker = context.Houses.Where(h => h.HouseCode == "51KER").SingleOrDefault();

            User toby = context.Users.Where(u => u.FirstName == "Toby").SingleOrDefault();
            User tom = context.Users.Where(u => u.LastName == "Walton").SingleOrDefault();

            context.CommunalMessages.Add(new CommunalMessage { Content = "Hey Everyone", User = tom, House = ker });
            context.CommunalMessages.Add(new CommunalMessage { Content = "Hi Chaps", User = toby, House = ker });

            context.SaveChanges();
        }

        private void InitActivityLogs(TenantOrganiserDbContext context)
        {
            User toby = context.Users.Where(u => u.LastName == "Webster").SingleOrDefault();
            User walton = context.Users.Where(u => u.LastName == "Walton").SingleOrDefault();
            User marriott = context.Users.Where(u => u.LastName == "Marriott").SingleOrDefault();
            User whittle = context.Users.Where(u => u.LastName == "Whittle").SingleOrDefault();
            User lewis = context.Users.Where(u => u.LastName == "Lewis").SingleOrDefault();

            House ker = context.Houses.Where(h => h.HouseCode == "51KER").SingleOrDefault();

            context.ActivityLogs.Add(new ActivityLog { LogName = "Bill", ActionMessage = "Paid the Water bill.", Date = DateTime.Parse("20/03/2014"), User = toby, House = ker });
            context.ActivityLogs.Add(new ActivityLog { LogName = "Bill", ActionMessage = "Paid the Gas bill.", Date = DateTime.Parse("21/03/2014"), User = walton, House = ker });
            context.ActivityLogs.Add(new ActivityLog { LogName = "Cleaning Rota", ActionMessage = "Cleaned the Living Room.", Date = DateTime.Parse("22/03/2014"), User = marriott, House = ker });
            context.ActivityLogs.Add(new ActivityLog { LogName = "Bin Rota", ActionMessage = "Added a Pink Bins rota.", Date = DateTime.Parse("23/03/2014"), User = whittle, House = ker });
            context.ActivityLogs.Add(new ActivityLog { LogName = "Wish List", ActionMessage = "Purchased the Dish-o-Matic.", Date = DateTime.Parse("24/03/2014"), User = lewis, House = ker });

            context.SaveChanges();
        }

        private void InitBinRotas(TenantOrganiserDbContext context)
        {
            House ker = context.Houses.Where(h => h.HouseCode == "51KER").SingleOrDefault();

            context.BinRotas.Add(new BinRota { Name = "Green Bins", FrequencyDays = 14, Colour = "green", StartDate = DateTime.Parse("26/03/2011"), House = ker });
            context.BinRotas.Add(new BinRota { Name = "Black Bins", FrequencyDays = 7, Colour = "black", StartDate = DateTime.Parse("05/02/2011"), House = ker });

            context.SaveChanges();
        }

    }
}