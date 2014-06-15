namespace App.Models.Domain.Identity {
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.Globalization;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;

    public class AppUser : IdentityUser<int, AppUserLogin, AppUserRole, AppUserClaim> {
        [Required]
        public virtual AppOwner Group { get; set; }

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

        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<AppUser, int> manager) {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            
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