namespace App.Models.DTO {
    using System;
    using System.Runtime.Serialization;
    using Domain;

    [DataContract]
    public class Sheet {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "subject")]
        public DateTime Subject { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "updateTimestamp")]
        public DateTime UpdateTimestamp { get; set; }

        [DataMember(Name = "createTimestamp")]
        public DateTime CreateTimestamp { get; set; }

        [DataMember(Name = "entries")]
        public SheetEntry[] Entries { get; set; }

        [DataMember(Name = "offset")]
        public CalculationOptions Offset { get; set; }
    }

 
}