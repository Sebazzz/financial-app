namespace App.Migrations
{
    using System.Data.Entity.Migrations;
    
    public partial class SheetEntrySortOrder : DbMigration
    {
        public override void Up()
        {
            this.AddColumn("dbo.SheetEntries", "SortOrder", c => c.Int(nullable: false, defaultValue:0));
            this.Sql("UPDATE dbo.SheetEntries SET SortOrder = Id");
        }
        
        public override void Down()
        {
            this.DropColumn("dbo.SheetEntries", "SortOrder");
        }
    }
}
