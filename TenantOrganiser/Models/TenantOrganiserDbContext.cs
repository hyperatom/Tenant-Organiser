using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace TenantOrganiser
{
    /// <summary>
    /// Context for managing the Tenant Organiser database.
    /// </summary>
    public class TenantOrganiserDbContext : DbContext
    {

        public DbSet<User> Users { get; set; }
        public DbSet<UserSettings> UserSettings { get; set; }

        public DbSet<House> Houses { get; set; }
        public DbSet<HouseJoinRequest> HouseJoinRequests { get; set; }

        public DbSet<BillType> BillTypes { get; set; }
        public DbSet<BillInvoice> BillInvoices { get; set; }
        public DbSet<InvoiceRecipient> InvoiceRecipients { get; set; }

        public DbSet<CleaningRota> CleaningRotas { get; set; }
        public DbSet<CleaningLog> CleaningLogs { get; set; }
        public DbSet<BinRota> BinRotas { get; set; }

        public DbSet<CommunalMessage> CommunalMessages { get; set; }
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<ConversationUser> ConversationUsers { get; set; }
        public DbSet<Message> Messages { get; set; }

        public DbSet<WishListItem> WishListItems { get; set; }

        public DbSet<ActivityLog> ActivityLogs { get; set; }

        /// <summary>
        /// Initialises the context.
        /// </summary>
        public TenantOrganiserDbContext()
            : base(nameOrConnectionString: "TenantOrganiser") 
        {
            // Use custom initialiser
            Database.SetInitializer<TenantOrganiserDbContext>(new TenantOrganiserDbInitialiser());
        }

        /// <summary>
        /// Applies relationships between database entities.
        /// </summary>
        /// <param name="modelBuilder">Model builder.</param>
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // Use singular table names
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            modelBuilder.Conventions.Remove<ManyToManyCascadeDeleteConvention>();
            modelBuilder.Conventions.Remove<OneToOneConstraintIntroductionConvention>();
            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();

            base.OnModelCreating(modelBuilder);
        }
    }
}