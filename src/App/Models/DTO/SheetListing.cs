// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetListing.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System;
    using System.Runtime.Serialization;
    using Domain;

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

        [DataMember]
        public SheetTotals Totals { get; set; }
    }

    [DataContract]
    public class SheetTotals {
        [DataMember]
        public decimal? SavingsAccount { get; set; }
        [DataMember]
        public decimal? BankAccount { get; set; }
    }
}