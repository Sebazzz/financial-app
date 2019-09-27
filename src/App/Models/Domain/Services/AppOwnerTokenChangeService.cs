// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppOwnerTokenChangeService.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.Domain.Services {
    using System.Globalization;
    using System.Linq;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Api.Extensions;
    using Identity;
    using Microsoft.AspNetCore.Authentication;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Identity;

    public sealed class AppOwnerTokenChangeService {
        private readonly AppUserManager _appUserManager;

        public AppOwnerTokenChangeService(AppUserManager appUserManager) {
            this._appUserManager = appUserManager;
        }

        public async Task ChangeActiveGroupAsync(ClaimsPrincipal currentPrincipal, AppUser currentUser, AppOwner newGroup, HttpContext httpContext) {
            // Determine active owned group (before impersonation)
            int? currentOwnedGroupId = currentPrincipal.Identity.GetPreviousActiveOwnedOwnerGroupId() ?? currentUser.AvailableGroups.FirstOrDefault(x => x.GroupId == currentUser.CurrentGroupId && x.HasOwnership)?.GroupId;

            if (currentOwnedGroupId == null) {
                currentOwnedGroupId = currentUser.AvailableGroups.First(x => x.HasOwnership).GroupId;
            }

            // Change the group and save
            currentUser.CurrentGroup = newGroup;
            currentUser.CurrentGroupId = newGroup.Id;

            await this._appUserManager.UpdateAsync(currentUser);

            // Send new login token
            var identity = ((ClaimsIdentity)currentPrincipal.Identity);
            identity.TryRemoveClaim(identity.FindFirst(AppClaimTypes.AppOwnerGroup));
            identity.AddClaim(new Claim(AppClaimTypes.AppOwnerGroup, currentUser.CurrentGroupId.ToString(CultureInfo.InvariantCulture)));

            identity.TryRemoveClaim(identity.FindFirst(AppClaimTypes.PreviousActiveOwnedAppOwnerGroup));

            if (currentUser.AvailableGroups.Any(x=> x.HasOwnership == false && x.GroupId == newGroup.Id)) {
                identity.AddClaim(new Claim(AppClaimTypes.PreviousActiveOwnedAppOwnerGroup, currentOwnedGroupId.Value.ToString(CultureInfo.InvariantCulture)));
            }

            await httpContext.SignInAsync(IdentityConstants.ApplicationScheme, currentPrincipal);
        }

    }
}