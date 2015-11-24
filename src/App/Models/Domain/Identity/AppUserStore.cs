namespace App.Models.Domain.Identity {
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;

    public sealed class AppUserStore : UserStore<AppUser, AppRole, AppDbContext, int> {
        public AppUserStore(AppDbContext context, IdentityErrorDescriber describer = null) : base(context, describer) {}
    }
}