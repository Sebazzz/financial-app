namespace App.Models.Domain.Identity {
    using System.ComponentModel.DataAnnotations;
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