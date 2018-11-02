// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TrustedUsersExtensions.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Services {
    using System.Collections.Generic;
    using System.Linq;
    using Identity;

    public static class TrustedUsersExtensions {
        public static bool Contains(this IEnumerable<AppUserTrustedUser> collection, AppUser trustee) {
            return collection.Any(x => x.SourceUser == trustee);
        }

        public static AppUserTrustedUser GetForTrustee(this IEnumerable<AppUserTrustedUser> collection, AppUser trustee) {
            return collection.SingleOrDefault(x => x.TargetUser == trustee && x.IsActive);
        }

        public static AppUserTrustedUser GetForGroup(this IEnumerable<AppUserTrustedUser> collection, int groupId) {
            return collection.FirstOrDefault(x => x.Group.Id == groupId && x.IsActive);
        }
    }
}