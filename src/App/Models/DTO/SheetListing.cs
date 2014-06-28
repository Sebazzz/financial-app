namespace App.Models.DTO {
    using System;
    using System.Runtime.Serialization;

    [DataContract]
    public class SheetListing {
        [DataMember]
        public int Month { get; set; }

        [DataMember]
        public int Year { get; set; }

        /// <summary>
        /// Custom name, if set
        /// </summary>
        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public DateTime UpdateTimestamp { get; set; }

        [DataMember]
        public DateTime CreateTimestamp { get; set; }
    }
}