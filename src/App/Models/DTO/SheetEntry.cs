// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetEntry.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;
    using Domain.Services;

    using Validation;

    [DataContract]
    public abstract class SheetEntryBase : IHasSortOrder {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        [Required(ErrorMessage = "Selecteer een categorie")]
        public int? CategoryId { get; set; }

        [DataMember]
        public int? TemplateId { get; set; }


        [DataMember]
        [CurrencyDeltaValidation]
        public decimal Delta { get; set; }

        [DataMember]
        [Required(ErrorMessage = "Voer een bron of reden in")]
        [StringLength(512, MinimumLength = 1, ErrorMessage = "Voer een bron of reden in")]
        public string Source { get; set; }

        [DataMember]
        public string Remark { get; set; }

        [DataMember]
        [Required]
        public int SortOrder { get; set; }

        [DataMember]
        public DateTime UpdateTimestamp { get; set; }

        [DataMember]
        public DateTime CreateTimestamp { get; set; }

        [DataMember]
        [Required]
        public AccountType Account { get; set; }

        [DataMember]
        public int[] Tags { get; set; }
    }

    [DataContract]
    public class SheetEntry : SheetEntryBase
    {
        [DataMember]
        public bool IsNewSinceLastVisit { get; set; }
    }

    [DataContract]
    public sealed class TagReportSheetEntry : SheetEntryBase {
        [DataMember]
        public DateTime SheetSubject { get; set; }

        [DataMember]
        public string CategoryName { get; set; }
    }
}
