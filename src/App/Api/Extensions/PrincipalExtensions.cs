// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : PrincipalExtensions.cs
//  Project         : App
// ******************************************************************************
namespace App.Api.Extensions {
    using System;
    using System.Globalization;
    using System.IO;
    using System.Security.Claims;
    using System.Security.Principal;

    public static class PrincipalExtensions {
        public static int GetOwnerGroupId([NotNull] this IIdentity identity) {
            if (identity == null) {
                throw new ArgumentNullException(nameof(identity));
            }

            if (!(identity is ClaimsIdentity claimsIdentity) || !identity.IsAuthenticated) {
                return 0;
            }

            return claimsIdentity.GetOwnerGroupId();
        }

        public static int GetOwnerGroupId([NotNull] this ClaimsIdentity claimsIdentity) {
            if (claimsIdentity == null) {
                throw new ArgumentNullException(nameof(claimsIdentity));
            }

            Claim foundClaim = claimsIdentity.FindFirst(AppClaimTypes.AppOwnerGroup);
            if (foundClaim == null) {
                throw new InvalidDataException($"Expected '{AppClaimTypes.AppOwnerGroup}' claim to be present");
            }

            return Int32.Parse(foundClaim.Value, CultureInfo.InvariantCulture);
        }

        public static int? GetPreviousActiveOwnedOwnerGroupId([NotNull] this IIdentity identity) {
            if (identity == null) {
                throw new ArgumentNullException(nameof(identity));
            }

            if (!(identity is ClaimsIdentity claimsIdentity) || !identity.IsAuthenticated) {
                return null;
            }

            return claimsIdentity.GetPreviousActiveOwnedOwnerGroupId();
        }

        public static int? GetPreviousActiveOwnedOwnerGroupId([NotNull] this ClaimsIdentity claimsIdentity) {
            if (claimsIdentity == null) {
                throw new ArgumentNullException(nameof(claimsIdentity));
            }

            Claim foundClaim = claimsIdentity.FindFirst(AppClaimTypes.PreviousActiveOwnedAppOwnerGroup);
            if (foundClaim == null) {
                return null;
            }

            return Int32.Parse(foundClaim.Value, CultureInfo.InvariantCulture);
        }

        public static int GetUserId([NotNull] this IIdentity identity) {
            if (identity == null) {
                throw new ArgumentNullException(nameof(identity));
            }

            if (!(identity is ClaimsIdentity claimsIdentity) || !identity.IsAuthenticated) {
                return 0;
            }

            return claimsIdentity.GetUserId();
        }

        public static int GetUserId([NotNull] this ClaimsIdentity claimsIdentity) {
            if (claimsIdentity == null) {
                throw new ArgumentNullException(nameof(claimsIdentity));
            }

            Claim foundClaim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);
            if (foundClaim == null) {
                throw new InvalidDataException("Expected 'NameIdentifier' claim to be present");
            }

            return Int32.Parse(foundClaim.Value, CultureInfo.InvariantCulture);
        }
    }
}