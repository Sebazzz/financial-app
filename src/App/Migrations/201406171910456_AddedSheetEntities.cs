namespace App.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddedSheetEntities : DbMigration
    {
        public override void Up()
        {
            this.CreateTable(
                "dbo.SheetEntries",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Delta = c.Decimal(nullable: false, precision: 18, scale: 2),
                        Source = c.String(maxLength: 250),
                        Remark = c.String(),
                        UpdateTimestamp = c.DateTime(nullable: false),
                        CreateTimestamp = c.DateTime(nullable: false),
                        Account = c.Int(nullable: false),
                        Category_Id = c.Int(nullable: false),
                        Sheet_Id = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Categories", t => t.Category_Id)
                .ForeignKey("dbo.Sheets", t => t.Sheet_Id, cascadeDelete: true)
                .Index(t => t.Category_Id)
                .Index(t => t.Sheet_Id);

            this.CreateTable(
                "dbo.Sheets",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Subject = c.DateTime(nullable: false),
                        UpdateTimestamp = c.DateTime(nullable: false),
                        CreateTimestamp = c.DateTime(nullable: false),
                        Owner_Id = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AppOwners", t => t.Owner_Id, cascadeDelete: true)
                .Index(t => t.Owner_Id);
            
        }
        
        public override void Down()
        {
            this.DropForeignKey("dbo.SheetEntries", "Sheet_Id", "dbo.Sheets");
            this.DropForeignKey("dbo.Sheets", "Owner_Id", "dbo.AppOwners");
            this.DropForeignKey("dbo.SheetEntries", "Category_Id", "dbo.Categories");
            this.DropIndex("dbo.Sheets", new[] { "Owner_Id" });
            this.DropIndex("dbo.SheetEntries", new[] { "Sheet_Id" });
            this.DropIndex("dbo.SheetEntries", new[] { "Category_Id" });
            this.DropTable("dbo.Sheets");
            this.DropTable("dbo.SheetEntries");
        }
    }
}
