namespace App.Models.Domain.Identity {
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.ComponentModel.DataAnnotations;
    using System.Globalization;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;

    public class AppUser : IdentityUser<int, AppUserLogin, AppUserRole, AppUserClaim> {
        private ICollection<AppUser> _trustedUsers;

        [Required]
        public virtual AppOwner Group { get; set; }

        /// <summary>
        /// Gets a list of trusted app users the current user may impersonate.
        /// </summary>
        public virtual ICollection<AppUser> TrustedUsers {
            get { return this._trustedUsers ?? (this._trustedUsers = new Collection<AppUser>()); }
            set { this._trustedUsers = value; }
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public AppUser() {}

        public static AppUser Create(string name, string email, AppOwner group) {
            return new AppUser {
                                   UserName = name,
                                   Email = email,
                                   Group = group
                               };
        }

        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<AppUser, int> manager, string authType) {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, authType);
            
            // Custom user claims
            userIdentity.AddClaim(
                new Claim("AppOwnerGroup", this.Group.Id.ToString(CultureInfo.InvariantCulture), typeof(Int32).FullName));

            return userIdentity;
        }
    }

    public class AppUserLogin : IdentityUserLogin<int> {
        
    }

    public class AppUserRole : IdentityUserRole<int> {
        public virtual AppRole Role { get; set; }
        public virtual AppUser User { get; set; }
    }

    public class AppRole : IdentityRole<int, AppUserRole> {
        
    }

    public class AppUserClaim : IdentityUserClaim<int> {
        
    }
}