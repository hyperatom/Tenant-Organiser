namespace TenantOrganiser.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class FacebookUser : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.User", "IsFacebookUser", c => c.Boolean(nullable: false, defaultValue: false));
            AlterColumn("dbo.User", "Password", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.User", "Password", c => c.String(nullable: false));
            DropColumn("dbo.User", "IsFacebookUser");
        }
    }
}
