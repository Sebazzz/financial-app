namespace App.Models.Domain.Identity {
    using Microsoft.AspNet.Identity;

    public sealed class AppUserManager : UserManager<AppUser, int> {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="store">The IUserStore is responsible for commiting changes via the UpdateAsync/CreateAsync methods</param>
        public AppUserManager(IUserStore<AppUser, int> store) : base(store) {
            
        }
    }
}