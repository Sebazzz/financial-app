namespace App.Models.Domain {
    public sealed class CalculationOptions {
        public decimal? SavingsAccountOffset { get; set; }

        public decimal? BankAccountOffset { get; set; }
    }
}