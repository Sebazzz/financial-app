namespace App.Api.Extensions {
    using System;
    using System.Globalization;
    using System.IO;
    using System.Security.Claims;
    using System.Security.Principal;

    public static class PrincipalExtensions {
        public static int GetOwnerGroupId([NotNull] this IIdentity identity) {
            if (identity == null) {
                throw new ArgumentNullException("identity");
            }

            ClaimsIdentity claimsIdentity = identity as ClaimsIdentity;
            if (claimsIdentity == null) {
                return 0;
            }

            Claim foundClaim = claimsIdentity.FindFirst("AppOwnerGroup");
            if (foundClaim == null) {
                throw new InvalidDataException("Expected 'AppOwnerGroup' claim to be present");
            }

            return Int32.Parse(foundClaim.Value, CultureInfo.InvariantCulture);
        }
    }
}