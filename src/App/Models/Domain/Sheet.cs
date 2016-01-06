namespace App.Models.Domain {
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.ComponentModel.DataAnnotations;
    using Repositories;

    /// <summary>
    /// Represents a sheet of months expenses
    /// </summary>
    [GenerateRepository]
    public class Sheet : IAppOwnerEntity, IHasId {
        private ICollection<SheetEntry> _entries;
        private ICollection<SheetRecurringSheetEntry> _applicableEntries;
        public int Id { get; set; }

        /// <summary>
        /// Custom name, if set
        /// </summary>
        [StringLength(250)]
        public string Name { get; set; }

        public DateTime Subject { get; set; }

        public DateTime UpdateTimestamp { get; set; }

        public DateTime CreateTimestamp { get; set; }

        public CalculationOptions CalculationOptions { get; set; }

        [Required]
        [GenerateRepositoryQuery(IsMultiple = true)]
        public virtual AppOwner Owner { get; set; }

        public virtual ICollection<SheetEntry> Entries {
            get { return this._entries ?? (this._entries = new Collection<SheetEntry>()); }
            set { this._entries = value; }
        }

        ///// <summary>
        ///// Gets the entries which are applicable as templates for this month
        ///// </summary>
        //public virtual ICollection<SheetRecurringSheetEntry> ApplicableTemplates
        //{
        //    get { return this._applicableEntries ?? (this._applicableEntries = new Collection<SheetRecurringSheetEntry>()); }
        //    set { this._applicableEntries = value; }
        //}

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public Sheet() {
            this.CreateTimestamp = DateTime.Now;
            this.UpdateTimestamp = DateTime.Now;

            this.CalculationOptions = new CalculationOptions();
        }

    }

    /// <summary>
    /// Workaround for EF not supporting many-to-many
    /// </summary>
    public class SheetRecurringSheetEntry {
        [Required]
        public virtual Sheet Sheet { get; set; }
        [Required]
        public virtual RecurringSheetEntry Template { get; set; }
        public virtual int Id { get; set; }
    }
}