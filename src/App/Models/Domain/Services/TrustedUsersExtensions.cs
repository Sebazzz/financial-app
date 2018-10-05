namespace App.Models.Domain.Services {
    using System.Collections.Generic;
    using System.Linq;
    using Identity;

    public static class TrustedUsersExtensions {
        public static bool Contains(this IEnumerable<AppUserTrustedUser> collection, AppUser trustee) {
            return collection.Any(x => x.SourceUser == trustee);
        }
    }
}