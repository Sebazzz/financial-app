// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Category.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain {
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;
    using App.Models.Validation;
    using Repositories;

    [DataContract]
    public class Category : IAppOwnerEntity, IHasId {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        [Required(ErrorMessage = "Naam is verplicht")]
        [StringLength(250, MinimumLength = 2)]
        public string Name { get; set; }

        [IgnoreDataMember]
        [Required]
        public virtual AppOwner Owner { get; set; }

        [DataMember]
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets the set monthly budget for this category
        /// </summary>
        [DataMember]
        [CurrencyDeltaValidation]
        public decimal? MonthlyBudget { get; set; }
    }
}
