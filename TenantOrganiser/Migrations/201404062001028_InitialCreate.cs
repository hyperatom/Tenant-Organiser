namespace TenantOrganiser.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InitialCreate : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.User",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        FirstName = c.String(nullable: false),
                        LastName = c.String(nullable: false),
                        Email = c.String(nullable: false),
                        Password = c.String(nullable: false),
                        EmailNotifications = c.Boolean(nullable: false),
                        DisplayPictureFileName = c.String(),
                        HouseId = c.Int(),
                        UserSettingsId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.House", t => t.HouseId)
                .ForeignKey("dbo.UserSettings", t => t.UserSettingsId)
                .Index(t => t.HouseId)
                .Index(t => t.UserSettingsId);
            
            CreateTable(
                "dbo.House",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        HouseName = c.String(nullable: false),
                        HouseCode = c.String(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.UserSettings",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        EmailNotifications = c.Boolean(nullable: false),
                        CleaningRotaGroup = c.Int(),
                        BinCollectionRotaGroup = c.Int(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.HouseJoinRequest",
                c => new
                    {
                        UserId = c.Int(nullable: false),
                        HouseId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.UserId, t.HouseId })
                .ForeignKey("dbo.User", t => t.UserId)
                .ForeignKey("dbo.House", t => t.HouseId)
                .Index(t => t.UserId)
                .Index(t => t.HouseId);
            
            CreateTable(
                "dbo.BillType",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false),
                        ManagerId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.User", t => t.ManagerId)
                .Index(t => t.ManagerId);
            
            CreateTable(
                "dbo.BillInvoice",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        DueDate = c.DateTime(nullable: false),
                        BillTypeId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.BillType", t => t.BillTypeId)
                .Index(t => t.BillTypeId);
            
            CreateTable(
                "dbo.InvoiceRecipient",
                c => new
                    {
                        UserId = c.Int(nullable: false),
                        BillInvoiceId = c.Int(nullable: false),
                        Amount = c.Double(nullable: false),
                        Paid = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => new { t.UserId, t.BillInvoiceId })
                .ForeignKey("dbo.User", t => t.UserId)
                .ForeignKey("dbo.BillInvoice", t => t.BillInvoiceId)
                .Index(t => t.UserId)
                .Index(t => t.BillInvoiceId);
            
            CreateTable(
                "dbo.CommunalArea",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false),
                        HouseId = c.Int(nullable: false),
                        CleaningRotaId = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.House", t => t.HouseId)
                .ForeignKey("dbo.CleaningRota", t => t.CleaningRotaId)
                .Index(t => t.HouseId)
                .Index(t => t.CleaningRotaId);
            
            CreateTable(
                "dbo.CleaningRota",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        StartDate = c.DateTime(nullable: false),
                        FrequencyDays = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.CleaningLog",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Date = c.DateTime(nullable: false),
                        UserId = c.Int(nullable: false),
                        CommunalAreaId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.User", t => t.UserId)
                .ForeignKey("dbo.CommunalArea", t => t.CommunalAreaId)
                .Index(t => t.UserId)
                .Index(t => t.CommunalAreaId);
            
            CreateTable(
                "dbo.BinRota",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false),
                        Colour = c.String(),
                        StartDate = c.DateTime(nullable: false),
                        FrequencyDays = c.Int(nullable: false),
                        HouseId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.House", t => t.HouseId)
                .Index(t => t.HouseId);
            
            CreateTable(
                "dbo.CommunalMessage",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Content = c.String(nullable: false),
                        SentDate = c.DateTime(nullable: false),
                        UserId = c.Int(nullable: false),
                        HouseId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.User", t => t.UserId)
                .ForeignKey("dbo.House", t => t.HouseId)
                .Index(t => t.UserId)
                .Index(t => t.HouseId);
            
            CreateTable(
                "dbo.Conversation",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        DateStarted = c.DateTime(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.ConversationUser",
                c => new
                    {
                        UserId = c.Int(nullable: false),
                        ConversationId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.UserId, t.ConversationId })
                .ForeignKey("dbo.User", t => t.UserId)
                .ForeignKey("dbo.Conversation", t => t.ConversationId)
                .Index(t => t.UserId)
                .Index(t => t.ConversationId);
            
            CreateTable(
                "dbo.Message",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Content = c.String(nullable: false),
                        DateSent = c.DateTime(nullable: false),
                        UserId = c.Int(nullable: false),
                        ConversationId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.User", t => t.UserId)
                .ForeignKey("dbo.Conversation", t => t.ConversationId)
                .Index(t => t.UserId)
                .Index(t => t.ConversationId);
            
            CreateTable(
                "dbo.WishListItem",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        ItemName = c.String(nullable: false),
                        AquiredOn = c.DateTime(),
                        UserAcquiredId = c.Int(),
                        UserAddedId = c.Int(nullable: false),
                        HouseId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.User", t => t.UserAcquiredId)
                .ForeignKey("dbo.User", t => t.UserAddedId)
                .ForeignKey("dbo.House", t => t.HouseId)
                .Index(t => t.UserAcquiredId)
                .Index(t => t.UserAddedId)
                .Index(t => t.HouseId);
            
            CreateTable(
                "dbo.ActivityLog",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.Int(),
                        HouseId = c.Int(nullable: false),
                        LogName = c.String(nullable: false),
                        ActionMessage = c.String(nullable: false),
                        Date = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.User", t => t.UserId)
                .ForeignKey("dbo.House", t => t.HouseId)
                .Index(t => t.UserId)
                .Index(t => t.HouseId);
            
        }
        
        public override void Down()
        {
            DropIndex("dbo.ActivityLog", new[] { "HouseId" });
            DropIndex("dbo.ActivityLog", new[] { "UserId" });
            DropIndex("dbo.WishListItem", new[] { "HouseId" });
            DropIndex("dbo.WishListItem", new[] { "UserAddedId" });
            DropIndex("dbo.WishListItem", new[] { "UserAcquiredId" });
            DropIndex("dbo.Message", new[] { "ConversationId" });
            DropIndex("dbo.Message", new[] { "UserId" });
            DropIndex("dbo.ConversationUser", new[] { "ConversationId" });
            DropIndex("dbo.ConversationUser", new[] { "UserId" });
            DropIndex("dbo.CommunalMessage", new[] { "HouseId" });
            DropIndex("dbo.CommunalMessage", new[] { "UserId" });
            DropIndex("dbo.BinRota", new[] { "HouseId" });
            DropIndex("dbo.CleaningLog", new[] { "CommunalAreaId" });
            DropIndex("dbo.CleaningLog", new[] { "UserId" });
            DropIndex("dbo.CommunalArea", new[] { "CleaningRotaId" });
            DropIndex("dbo.CommunalArea", new[] { "HouseId" });
            DropIndex("dbo.InvoiceRecipient", new[] { "BillInvoiceId" });
            DropIndex("dbo.InvoiceRecipient", new[] { "UserId" });
            DropIndex("dbo.BillInvoice", new[] { "BillTypeId" });
            DropIndex("dbo.BillType", new[] { "ManagerId" });
            DropIndex("dbo.HouseJoinRequest", new[] { "HouseId" });
            DropIndex("dbo.HouseJoinRequest", new[] { "UserId" });
            DropIndex("dbo.User", new[] { "UserSettingsId" });
            DropIndex("dbo.User", new[] { "HouseId" });
            DropForeignKey("dbo.ActivityLog", "HouseId", "dbo.House");
            DropForeignKey("dbo.ActivityLog", "UserId", "dbo.User");
            DropForeignKey("dbo.WishListItem", "HouseId", "dbo.House");
            DropForeignKey("dbo.WishListItem", "UserAddedId", "dbo.User");
            DropForeignKey("dbo.WishListItem", "UserAcquiredId", "dbo.User");
            DropForeignKey("dbo.Message", "ConversationId", "dbo.Conversation");
            DropForeignKey("dbo.Message", "UserId", "dbo.User");
            DropForeignKey("dbo.ConversationUser", "ConversationId", "dbo.Conversation");
            DropForeignKey("dbo.ConversationUser", "UserId", "dbo.User");
            DropForeignKey("dbo.CommunalMessage", "HouseId", "dbo.House");
            DropForeignKey("dbo.CommunalMessage", "UserId", "dbo.User");
            DropForeignKey("dbo.BinRota", "HouseId", "dbo.House");
            DropForeignKey("dbo.CleaningLog", "CommunalAreaId", "dbo.CommunalArea");
            DropForeignKey("dbo.CleaningLog", "UserId", "dbo.User");
            DropForeignKey("dbo.CommunalArea", "CleaningRotaId", "dbo.CleaningRota");
            DropForeignKey("dbo.CommunalArea", "HouseId", "dbo.House");
            DropForeignKey("dbo.InvoiceRecipient", "BillInvoiceId", "dbo.BillInvoice");
            DropForeignKey("dbo.InvoiceRecipient", "UserId", "dbo.User");
            DropForeignKey("dbo.BillInvoice", "BillTypeId", "dbo.BillType");
            DropForeignKey("dbo.BillType", "ManagerId", "dbo.User");
            DropForeignKey("dbo.HouseJoinRequest", "HouseId", "dbo.House");
            DropForeignKey("dbo.HouseJoinRequest", "UserId", "dbo.User");
            DropForeignKey("dbo.User", "UserSettingsId", "dbo.UserSettings");
            DropForeignKey("dbo.User", "HouseId", "dbo.House");
            DropTable("dbo.ActivityLog");
            DropTable("dbo.WishListItem");
            DropTable("dbo.Message");
            DropTable("dbo.ConversationUser");
            DropTable("dbo.Conversation");
            DropTable("dbo.CommunalMessage");
            DropTable("dbo.BinRota");
            DropTable("dbo.CleaningLog");
            DropTable("dbo.CleaningRota");
            DropTable("dbo.CommunalArea");
            DropTable("dbo.InvoiceRecipient");
            DropTable("dbo.BillInvoice");
            DropTable("dbo.BillType");
            DropTable("dbo.HouseJoinRequest");
            DropTable("dbo.UserSettings");
            DropTable("dbo.House");
            DropTable("dbo.User");
        }
    }
}
