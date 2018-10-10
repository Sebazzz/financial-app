// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : RecurringSheetEntryListing.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System.Runtime.Serialization;
    using Domain.Services;

    [DataContract]
    public class RecurringSheetEntryListing {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        public int CategoryId { get; set; }

        [DataMember]
        public string CategoryName { get; set; }

        [DataMember]
        public int SortOrder { get; set; }

        [DataMember]
        public string Source { get; set; }

        [DataMember]
        public AccountType Account { get; set; }
    }
}