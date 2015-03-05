namespace App.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class SheetCalculationOffset : DbMigration
    {
        public override void Up()
        {
            this.AddColumn("dbo.Sheets", "CalculationOptions_SavingsAccountOffset", c => c.Decimal(precision: 18, scale: 2));
            this.AddColumn("dbo.Sheets", "CalculationOptions_BankAccountOffset", c => c.Decimal(precision: 18, scale: 2));
        }
        
        public override void Down()
        {
            this.DropColumn("dbo.Sheets", "CalculationOptions_BankAccountOffset");
            this.DropColumn("dbo.Sheets", "CalculationOptions_SavingsAccountOffset");
        }
    }
}
