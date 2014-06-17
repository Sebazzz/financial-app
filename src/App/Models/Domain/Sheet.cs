namespace App.Models.Domain {
    using System;
    using System.ComponentModel.DataAnnotations;
    using Repositories;

    /// <summary>
    /// Represents a sheet of months expenses
    /// </summary>
    [GenerateRepository]
    public class Sheet : IAppOwnerEntity {
        public int Id { get; set; }

        public DateTime Subject { get; set; }

        public DateTime UpdateTimestamp { get; set; }

        public DateTime CreateTimestamp { get; set; }

        [Required]
        public virtual AppOwner Owner { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public Sheet() {
            this.CreateTimestamp = DateTime.Now;
            this.UpdateTimestamp = DateTime.Now;
        }
    }
}