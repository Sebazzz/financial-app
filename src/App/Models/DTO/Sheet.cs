// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Sheet.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System;
    using System.Runtime.Serialization;
    using Domain;

    [DataContract]
    public class Sheet {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        public DateTime Subject { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public DateTime UpdateTimestamp { get; set; }

        [DataMember]
        public DateTime CreateTimestamp { get; set; }

        [DataMember]
        public SheetEntry[] Entries { get; set; }

        [DataMember]
        public RecurringSheetEntry[] ApplicableTemplates { get; set; }

        [DataMember]
        public CalculationOptions Offset { get; set; }
    }

 
}