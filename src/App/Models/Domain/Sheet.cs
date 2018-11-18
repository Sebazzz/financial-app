// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Sheet.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain {
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.ComponentModel.DataAnnotations;
    using Identity;
    using Repositories;

    /// <summary>
    /// Represents a sheet of months expenses
    /// </summary>
    public class Sheet : IAppOwnerEntity, IHasId {
        private ICollection<SheetEntry> _entries;
        private ICollection<SheetRecurringSheetEntry> _applicableTemplates;
        private CalculationOptions _calculationOptions;
        public int Id { get; set; }

        /// <summary>
        /// Custom name, if set
        /// </summary>
        [StringLength(250)]
        public string Name { get; set; }

        public DateTime Subject { get; set; }

        public DateTime UpdateTimestamp { get; set; }

        public DateTime CreateTimestamp { get; set; }

        public virtual CalculationOptions CalculationOptions
        {
            get => this._calculationOptions ?? (this._calculationOptions = new CalculationOptions());
            set => this._calculationOptions = value;
        }

        [Required]
        public virtual AppOwner Owner { get; set; }

        public virtual ICollection<SheetEntry> Entries {
            get => this._entries ?? (this._entries = new Collection<SheetEntry>());
            set => this._entries = value;
        }

        /// <summary>
        /// Gets the entries which are applicable as templates for this month
        /// </summary>
        public virtual ICollection<SheetRecurringSheetEntry> ApplicableTemplates
        {
            get => this._applicableTemplates ?? (this._applicableTemplates = new Collection<SheetRecurringSheetEntry>());
            set => this._applicableTemplates = value;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public Sheet() {
            this.CreateTimestamp = DateTime.Now;
            this.UpdateTimestamp = DateTime.Now;
        }

    }

    /// <summary>
    /// Represents the applicable templates for a sheet - seperate class [Workaround for EF not supporting many-to-many]
    /// </summary>
    public class SheetRecurringSheetEntry {
        [Required]
        public virtual Sheet Sheet { get; set; }
        [Required]
        public virtual RecurringSheetEntry Template { get; set; }
        public virtual int Id { get; set; }

        public static SheetRecurringSheetEntry Create(Sheet owner, RecurringSheetEntry template) {
            return new SheetRecurringSheetEntry {
                Sheet = owner,
                Template = template
            };
        }
    }


    public class SheetLastVisitedMarker : IHasId
    {
        public int Id { get; set; }

        [Required]
        public virtual Sheet Sheet { get; set; }

        public int SheetId { get; set; }

        [Required] public virtual AppUser User { get; set; }

        public int UserId { get;set; }

        public DateTime LastVisitDate { get; set; }
    }
}
