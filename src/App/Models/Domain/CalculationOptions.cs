namespace App.Models.Domain {
    using System.Runtime.Serialization;

    [DataContract]
    public class CalculationOptions {
        [DataMember]
        public decimal? SavingsAccountOffset { get; set; }

        [DataMember]
        public decimal? BankAccountOffset { get; set; }
    }
}