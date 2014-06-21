namespace App.Models.Domain {
    using System.Runtime.Serialization;

    [DataContract]
    public sealed class CalculationOptions {
        [DataMember(Name = "savingsAccountOffset")]
        public decimal? SavingsAccountOffset { get; set; }

        [DataMember(Name = "bankAccountOffset")]
        public decimal? BankAccountOffset { get; set; }
    }
}