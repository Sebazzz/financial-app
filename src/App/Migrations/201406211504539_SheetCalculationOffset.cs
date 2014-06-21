namespace App.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class SheetCalculationOffset : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Sheets", "CalculationOptions_SavingsAccountOffset", c => c.Decimal(precision: 18, scale: 2));
            AddColumn("dbo.Sheets", "CalculationOptions_BankAccountOffset", c => c.Decimal(precision: 18, scale: 2));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Sheets", "CalculationOptions_BankAccountOffset");
            DropColumn("dbo.Sheets", "CalculationOptions_SavingsAccountOffset");
        }
    }
}
