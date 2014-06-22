namespace App.Migrations
{
    using System.Data.Entity.Migrations;
    
    public partial class SheetEntrySortOrder : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.SheetEntries", "SortOrder", c => c.Int(nullable: false, defaultValue:0));
            Sql("UPDATE dbo.SheetEntries SET SortOrder = Id");
        }
        
        public override void Down()
        {
            DropColumn("dbo.SheetEntries", "SortOrder");
        }
    }
}
