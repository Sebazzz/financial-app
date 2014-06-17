namespace App.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class SheetCustomName : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Sheets", "Name", c => c.String(maxLength: 250));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Sheets", "Name");
        }
    }
}
