namespace App.Models.Domain.Identity {
    using Microsoft.AspNet.Identity.EntityFramework;

    public class AppUser : IdentityUser<int, AppUserLogin, AppUserRole, AppUserClaim> {
        
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