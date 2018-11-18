// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppOwner.cs
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
    /// Represents a group of owners - this allows defining shared objects
    /// </summary>
    public class AppOwner {
        private ICollection<AppUser> _users;

        public int Id { get; set; }

        public virtual ICollection<AppUser> Users {
            get => this._users ?? (this._users = new Collection<AppUser>());
            set => this._users = value;
        }

        [Required]
        public string Name { get; set; }

        /// <summary>
        /// Gets the last date a monthly digest was sent. 
        /// </summary>
        public DateTime LastMonthlyDigestTimestamp { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public AppOwner() {}

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public AppOwner(string name) {
            this.Name = name;
        }
    }


    public class AppUserAvailableGroup {
        public virtual int Id { get; set; }

        [Required]
        public virtual AppOwner Group { get; set; }

        public virtual int GroupId { get;set; }

        [Required]
        public virtual AppUser User { get; set; }

        public virtual int UserId { get; set; }

        public virtual bool HasOwnership { get; set; }
    }
}
