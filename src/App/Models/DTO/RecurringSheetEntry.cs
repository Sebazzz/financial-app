// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : RecurringSheetEntry.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;
    using Domain.Services;

    using Validation;

    [DataContract]
    public class RecurringSheetEntry {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        [Required(ErrorMessage = "Kies een categorie")]
        public int? CategoryId { get; set; }

        [DataMember]
        [Required(ErrorMessage = "Vul een bedrag in")]
        [CurrencyDeltaValidation]
        public decimal Delta { get; set; }

        [DataMember]
        public int SortOrder { get; set; }

        [DataMember]
        [Required(ErrorMessage = "Vul een reden / bron in")]
        public string Source { get; set; }

        [DataMember]
        public string Remark { get; set; }

        [DataMember]
        [Required(ErrorMessage = "Kies het type mutatie")]
        public AccountType? Account { get; set; }
    }
}