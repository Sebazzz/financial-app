namespace App.Models.Domain {
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.ComponentModel.DataAnnotations;
    using Identity;

    /// <summary>
    /// Represents a group of owners
    /// </summary>
    public class AppOwner {
        private ICollection<AppUser> _users;

        public int Id { get; set; }

        public virtual ICollection<AppUser> Users {
            get { return this._users ?? (this._users = new Collection<AppUser>()); }
            set { this._users = value; }
        }

        [Required]
        public string Name { get; set; }
    }
}