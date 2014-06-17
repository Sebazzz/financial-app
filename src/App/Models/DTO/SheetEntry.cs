namespace App.Models.DTO {
    using System;
    using System.Runtime.Serialization;
    using Domain;

    [DataContract]
    public class SheetEntry {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "categoryId")]
        public int CategoryId { get; set; }

        [DataMember(Name = "delta")]
        public decimal Delta { get; set; }

        [DataMember(Name = "source")]
        public string Source { get; set; }

        [DataMember(Name = "remark")]
        public string Remark { get; set; }

        [DataMember(Name = "updateTimestamp")]
        public DateTime UpdateTimestamp { get; set; }

        [DataMember(Name = "createTimestamp")]
        public DateTime CreateTimestamp { get; set; }

        [DataMember(Name = "account")]
        public AccountType Account { get; set; }
    }
}