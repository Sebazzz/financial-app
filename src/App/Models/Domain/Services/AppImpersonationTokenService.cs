// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppImpersonationtokenService.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.Domain.Services {
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Identity;
    using Microsoft.EntityFrameworkCore;
    using Repositories;

    public sealed class AppImpersonationTokenService {
        private readonly AppUserManager _appUserManager;
        private readonly AppUserTrustedUserRepository _appUserTrustedUserRepository;

        public AppImpersonationTokenService(AppUserManager appUserManager, AppUserTrustedUserRepository appUserTrustedUserRepository) {
            this._appUserManager = appUserManager;
            this._appUserTrustedUserRepository = appUserTrustedUserRepository;
        }

        public IEnumerable<AppUserTrustedUser> GetOutstandingImpersonations(AppUser user) {
            return from trustedUser in user.AvailableImpersonations
                where !trustedUser.IsActive
                select trustedUser;
        }

        public async Task<AppUserTrustedUser> CreateImpersonationInvite(AppUser user) {
            AppUserTrustedUser impersonationToken = new AppUserTrustedUser {
                CreationDate = DateTimeOffset.Now,
                IsActive = false,
                SecurityToken = Guid.NewGuid().ToString("N"),
                SourceUser = user
            };
            user.AvailableImpersonations.Add(impersonationToken);

            await this._appUserTrustedUserRepository.SaveChangesAsync();
            await this._appUserManager.UpdateAsync(user);

            return impersonationToken;
        }

        public async Task<AppUser> GetImpersonationUser(AppUser currentUser, int impersonationUserId) {
            AppUser impersonatingUser = await this._appUserManager.Users.Where(x => x.Id == impersonationUserId).Include(x => x.AvailableImpersonations)
                .FirstOrDefaultAsync();

            if (impersonatingUser == null) throw new ImpersonationNotAllowedException();

            if (!impersonatingUser.AvailableImpersonations.Contains(currentUser)) throw new ImpersonationNotAllowedException();

            return impersonatingUser;
        }

        public async Task DeleteImpersonationToken(AppUser currentUser, string securityToken) {
            foreach (AppUserTrustedUser availableImpersonation in currentUser.AvailableImpersonations) {
                if (String.Equals(availableImpersonation.SecurityToken, securityToken)) {
                    this._appUserTrustedUserRepository.Remove(availableImpersonation);
                    currentUser.AvailableImpersonations.Remove(availableImpersonation);
                    break;
                }
            }

            await this._appUserTrustedUserRepository.SaveChangesAsync();
            await this._appUserManager.UpdateAsync(currentUser);
        }

        public async Task CompleteImpersonationInvite(AppUser currentUser, string securityToken) {
            AppUser sourceUser = await this._appUserManager.Users.Where(u => u.AvailableImpersonations.Any(x => x.SecurityToken == securityToken && !x.IsActive)).Include(x => x.AvailableImpersonations).FirstOrDefaultAsync();

            if (sourceUser == null) throw new ImpersonationNotAllowedException();

            AppUserTrustedUser item = sourceUser.AvailableImpersonations.FirstOrDefault(x => x.SecurityToken == securityToken && !x.IsActive);
            if (item == null) throw new ImpersonationNotAllowedException();
            if (sourceUser == currentUser) throw new ImpersonationNotAllowedException();

            item.IsActive = true;
            item.TargetUser = currentUser;
            item.CreationDate = DateTimeOffset.Now;

            await this._appUserTrustedUserRepository.SaveChangesAsync();
        }

    }

    [Serializable]
    public class ImpersonationNotAllowedException : Exception {
    }
}