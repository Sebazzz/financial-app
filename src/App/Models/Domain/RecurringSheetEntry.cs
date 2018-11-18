// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : RecurringSheetEntry.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain {
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using Repositories;
    using Services;

    /// <summary>
    /// Represents a recurring sheet entry - expenses or income which is 'to be expected' each period (for now: month). In effective
    /// a recurring sheet entry is a template.
    /// </summary>
    public class RecurringSheetEntry : IHasId, IAppOwnerEntity {
        public int Id { get; set; }

        [Required]
        public virtual Category Category { get; set; }

        public decimal Delta { get; set; }

        [StringLength(250)]
        public string Source { get; set; }

        public string Remark { get; set; }

        /// <summary>
        /// Gets or sets the relative order of this expense. This is used so the algorithm can predict the expenses.
        /// </summary>
        public int SortOrder { get; set; }

        public AccountType Account { get; set; }

        [Required]
        public virtual AppOwner Owner { get; set; }

    }
}
