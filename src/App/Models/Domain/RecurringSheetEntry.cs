namespace App.Models.Domain {
    using System;
    using System.ComponentModel.DataAnnotations;
    using Repositories;
    using Services;

    /// <summary>
    /// Represents a recurring sheet entry - expenses or income which is 'to be expected' each period (for now: month). In effective
    /// a recurring sheet entry is a template.
    /// </summary>
    [GenerateRepository]
    public class RecurringSheetEntry : IHasId, IAppOwnerEntity {
        public int Id { get; set; }

        [Required]
        public virtual Category Category { get; set; }

        public decimal Delta { get; set; }

        [StringLength(250)]
        public string Source { get; set; }
        public string Remark { get; set; }

        public int SortOrder { get; set; }

        public AccountType Account { get; set; }

        [Required]
        public virtual AppOwner Owner { get; set; }
    }
}