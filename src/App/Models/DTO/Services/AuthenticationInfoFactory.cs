// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AuthenticationInfoFactory.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.DTO.Services {
    using System;
    using System.Linq;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Api.Extensions;
    using Domain.Identity;

    public sealed class AuthenticationInfoFactory {
        private readonly AppUserManager _appUserManager;

        public AuthenticationInfoFactory(AppUserManager appUserManager) {
            this._appUserManager = appUserManager;
        }

        public async Task<AuthenticationInfo> CreateAsync(AppUser user, ClaimsPrincipal currentLoggedInPrincipal) {
            // Determine previous active group ID
            Int32? previousActiveOwnedGroupId = currentLoggedInPrincipal.Identity.GetPreviousActiveOwnedOwnerGroupId() ??
                                                user.AvailableGroups.FirstOrDefault(x => x.HasOwnership)?.GroupId;

            return new AuthenticationInfo {
                IsAuthenticated = true,
                CurrentGroupName = user.CurrentGroup.Name,
                UserId = user.Id,
                UserName = user.UserName,
                PreviousActiveOwnedGroupId = user.AvailableGroups.Any(x => x.GroupId == user.CurrentGroupId && !x.HasOwnership) ? previousActiveOwnedGroupId : null,
                Roles = (await this._appUserManager.GetRolesAsync(user)).ToArray()
            };
        }
    }
}
