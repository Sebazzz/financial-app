namespace App.Models.Domain {
    using System.Runtime.Serialization;

    [DataContract]
    public sealed class CalculationOptions {
        [DataMember]
        public decimal? SavingsAccountOffset { get; set; }

        [DataMember]
        public decimal? BankAccountOffset { get; set; }
    }
}