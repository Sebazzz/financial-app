// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppUserManager.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Identity {
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Globalization;
    using System.Linq;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Support.Mailing;

    public sealed class AppUserValidator : UserValidator<AppUser> {
        public AppUserValidator(IdentityErrorDescriber errors = null) : base(errors) {
        }
    }


    public sealed class AppPasswordValidator : PasswordValidator<AppUser> {
        public AppPasswordValidator(IdentityErrorDescriber errors = null) : base(errors) {
        }
    }

    public sealed class AppUserManager : AspNetUserManager<AppUser> {
        private readonly PasswordChangeNotificationMailer _passwordChangeNotificationMailer;
        private readonly TwoFactorChangeNotificationMailer _twoFactorChangeNotificationMailer;

        public AppUserManager(IUserStore<AppUser> store, IOptions<IdentityOptions> optionsAccessor, IPasswordHasher<AppUser> passwordHasher, IEnumerable<IUserValidator<AppUser>>  userValidators, IEnumerable<IPasswordValidator<AppUser>> passwordValidators, ILookupNormalizer keyNormalizer, IdentityErrorDescriber errors, IServiceProvider services, Microsoft.Extensions.Logging.ILogger<UserManager<AppUser>>  logger, PasswordChangeNotificationMailer passwordChangeNotificationMailer, TwoFactorChangeNotificationMailer twoFactorChangeNotificationMailer) : base(store, optionsAccessor, passwordHasher, userValidators, passwordValidators, keyNormalizer, errors, services, logger) {
            this._passwordChangeNotificationMailer = passwordChangeNotificationMailer;
            this._twoFactorChangeNotificationMailer = twoFactorChangeNotificationMailer;
        }

        public override async Task<IList<Claim>> GetClaimsAsync(AppUser user) {
            IList<Claim> claims = await base.GetClaimsAsync(user);

            claims.Add(new Claim("AppOwnerGroup", user.CurrentGroupId.ToString(CultureInfo.InvariantCulture), typeof(Int32).FullName));
            return claims;
        }

        public Task<AppUser> FindByIdAsync(int id) {
            return this.FindByIdAsync(id.ToString(CultureInfo.InvariantCulture));
        }

        public override Task<IList<AppUser>> GetUsersForClaimAsync(Claim claim) {
            if (claim.Type == "AppOwnerGroup") {
                return this.GetUsersForAppOwnerGroup(Int32.Parse(claim.Value));
            }

            return base.GetUsersForClaimAsync(claim);
        }

        private async Task<IList<AppUser>> GetUsersForAppOwnerGroup(int id) {
            return await this.Users.Where(x => x.CurrentGroupId == id).ToListAsync();
        }

        public override async Task<IdentityResult> ChangePasswordAsync(AppUser user, string currentPassword, string newPassword) {
            IdentityResult result = await base.ChangePasswordAsync(user, currentPassword, newPassword);

            if (result.Succeeded && !String.IsNullOrEmpty(user.Email)) {
                try {
                    await this._passwordChangeNotificationMailer.SendAsync(user.Email, user.UserName);
                }
                catch (Exception ex) {
                    this.Logger.LogError(ex, "Unable to send password change notification e-mail");
                }
            }

            return result;
        }

        public override async Task<IdentityResult> SetTwoFactorEnabledAsync(AppUser user, bool enabled) {
            IdentityResult result = await base.SetTwoFactorEnabledAsync(user, enabled);

            if (result.Succeeded && !String.IsNullOrEmpty(user.Email)) {
                try {
                    await this._twoFactorChangeNotificationMailer.SendAsync(user.Email, user.UserName, enabled);
                }
                catch (Exception ex) {
                    this.Logger.LogError(ex, "Unable to send two-factor change notification e-mail");
                }
            }

            return result;
        }
    }

    public sealed class AppRoleManager : AspNetRoleManager<AppRole> {
        public AppRoleManager(IRoleStore<AppRole> store, IEnumerable<IRoleValidator<AppRole>> roleValidators, ILookupNormalizer keyNormalizer, IdentityErrorDescriber errors, ILogger<RoleManager<AppRole>> logger, IHttpContextAccessor contextAccessor) : base(store, roleValidators, keyNormalizer, errors, logger, contextAccessor) { }
    }

    public sealed class AppRoleValidator : RoleValidator<AppRole> {
        public AppRoleValidator(IdentityErrorDescriber errors = null) : base(errors) { }
    }
}