// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppImpersonationTokenService.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Services {
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using DTO;
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
            var impersonationToken = new AppUserTrustedUser {
                CreationDate = DateTimeOffset.Now,
                IsActive = false,
                SecurityToken = Guid.NewGuid().ToString("N"),
                SourceUser = user,
                Group = user.CurrentGroup
            };
            user.AvailableImpersonations.Add(impersonationToken);

            await this._appUserTrustedUserRepository.SaveChangesAsync();
            await this._appUserManager.UpdateAsync(user);

            return impersonationToken;
        }

        public async Task<AppOwner> GetImpersonationUserGroup(AppUser currentUser, int impersonationUserId) {
            AppUser impersonatingUser = await this._appUserManager.Users.Where(x => x.Id == impersonationUserId).FirstOrDefaultAsync();

            if (impersonatingUser == null) throw new ImpersonationNotAllowedException();

            AppUserTrustedUser item = currentUser.AvailableImpersonations.GetForTrustee(impersonatingUser);
            if (item == null) throw new ImpersonationNotAllowedException();

            return item.Group;
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
            item.SourceUser = currentUser;
            item.TargetUser = sourceUser;
            item.CreationDate = DateTimeOffset.Now;

            await this._appUserTrustedUserRepository.SaveChangesAsync();
        }

        public async Task<IEnumerable<AppUserTrustedUser>> GetAllowedImpersonations(AppUser currentUser) {
            List<AppUser> users = await this._appUserManager.Users.Where(u => u.AvailableImpersonations.Any(x => x.TargetUser.Id == currentUser.Id && x.IsActive)).Include(x => x.AvailableImpersonations).ThenInclude(x=>x.TargetUser).ToListAsync();

            return users.Select(x => x.AvailableImpersonations.Single(imp => imp.TargetUser.Id == currentUser.Id));
        }

        public async Task DeleteAllowedImpersonation(AppUser currentUser, string securityToken) {
            AppUser sourceUser = await this._appUserManager.Users.Where(u => u.AvailableImpersonations.Any(x => x.SecurityToken == securityToken && x.TargetUser.Id == currentUser.Id && x.IsActive)).Include(x => x.AvailableImpersonations).FirstOrDefaultAsync();

            foreach (AppUserTrustedUser impersonation in sourceUser.AvailableImpersonations) {
                if (impersonation.SecurityToken != securityToken) continue;

                this._appUserTrustedUserRepository.Remove(impersonation);
                await this._appUserTrustedUserRepository.SaveChangesAsync();
                return;
            }
        }
    }

    [Serializable]
    public class ImpersonationNotAllowedException : Exception {
    }
}