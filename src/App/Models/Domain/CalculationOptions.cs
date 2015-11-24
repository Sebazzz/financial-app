namespace App.Models.Domain {
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract]
    public sealed class CalculationOptions {
        [Key]
        public int SheetId { get; set; }

        [DataMember]
        public decimal? SavingsAccountOffset { get; set; }

        [DataMember]
        public decimal? BankAccountOffset { get; set; }
    }
}