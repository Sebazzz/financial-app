namespace App.Models.Domain.Identity {
    using System.Linq;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;

    public sealed class AppUserStore : UserStore<AppUser, AppRole, AppDbContext, int> {
        public AppUserStore(AppDbContext context, IdentityErrorDescriber describer = null) : base(context, describer) {}

        /// <summary>
        /// A navigation property for the users the store contains.
        /// </summary>
        public override IQueryable<AppUser> Users {
            get { return base.Users.Include(x => x.Group).Include(x => x.TrustedUsers); }
        }
    }
}