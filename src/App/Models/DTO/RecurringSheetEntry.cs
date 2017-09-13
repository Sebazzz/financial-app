﻿namespace App.Models.DTO {
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;
    using Domain.Services;

    [DataContract]
    public class RecurringSheetEntry : IValidatableObject {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        [Required(ErrorMessage = "Kies een categorie")]
        public int? CategoryId { get; set; }

        [DataMember]
        [Required(ErrorMessage = "Vul een bedrag in")]
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

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext) {
            if (this.Delta == 0) {
                yield return new ValidationResult("Geef een bedrag op", new[]{ nameof(this.Delta)});
            }
        }
    }
}