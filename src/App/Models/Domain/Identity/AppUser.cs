namespace App.Models.Domain.Identity
{
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.ComponentModel.DataAnnotations;
    using Microsoft.AspNetCore.Identity;

    public class AppUserTrustedUser
    {
        public virtual AppUser TargetUser { get; set; }

        [Required]
        public virtual AppUser SourceUser { get; set; }

        [Required]
        public virtual string SecurityToken { get; set; }

        [Required]
        public virtual bool IsActive { get;set; }

        public virtual DateTimeOffset CreationDate { get; set; }

        public virtual int Id { get; set; }
    }

    public class AppUserPreferences
    {
        public bool EnableMonthlyDigest { get; set; }
        public bool EnableLoginNotifications { get; set; }
        public bool GoToHomePageAfterContextSwitch { get; set; }

        public static AppUserPreferences CreateDefault()
        {
            return new AppUserPreferences { EnableLoginNotifications = true, GoToHomePageAfterContextSwitch = true };
        }
    }

    public class AppUser : IdentityUser<int>
    {
        private ICollection<AppUserTrustedUser> _availableImpersonations;
        private ICollection<AppUserAvailableGroup> _availableGroups;

        [Required]
        public virtual AppOwner CurrentGroup { get; set; }
        public int CurrentGroupId { get; set; }

        public virtual ICollection<AppUserAvailableGroup> AvailableGroups {
            get => this._availableGroups ?? (this._availableGroups = new Collection<AppUserAvailableGroup>());
            set => this._availableGroups = value;
        }

        public virtual AppUserPreferences Preferences { get; set; }


        /// <summary>
        /// Gets a list of trusted app users the current user may impersonate.
        /// </summary>
        public virtual ICollection<AppUserTrustedUser> AvailableImpersonations
        {
            get => this._availableImpersonations ?? (this._availableImpersonations = new Collection<AppUserTrustedUser>());
            set => this._availableImpersonations = value;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public AppUser() { }

        public static AppUser Create(string name, string email, AppOwner group)
        {
            return new AppUser
            {
                UserName = name,
                Email = email,
                CurrentGroup = group,
                Preferences = AppUserPreferences.CreateDefault()
            };
        }
    }

    public class AppUserLogin : IdentityUserLogin<int> {}

    public class AppUserRole : IdentityUserRole<int>
    {
        public virtual AppRole Role { get; set; }
        public virtual AppUser User { get; set; }
    }

    public class AppRole : IdentityRole<int>
    {
        public static class KnownRoles
        {
            public const string Administrator = "Administrator";
        }

    }

    public class AppUserClaim : IdentityUserClaim<int>
    {

    }
}