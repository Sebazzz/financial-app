namespace App.Models.Domain.Identity {
    using System.Data.Entity;
    using Microsoft.AspNet.Identity.EntityFramework;

    public sealed class AppUserStore : UserStore<AppUser, AppRole, int, AppUserLogin, AppUserRole, AppUserClaim> {
        /// <summary>
        /// Constructor which takes a db context and wires up the stores with default instances using the context
        /// </summary>
        /// <param name="context"/>
        public AppUserStore(DbContext context) : base(context) {}
    }
}