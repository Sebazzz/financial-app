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

    public sealed class AppUserValidator : UserValidator<AppUser> {
        public AppUserValidator(IdentityErrorDescriber errors = null) : base(errors) {
        }
    }


    public sealed class AppPasswordValidator : PasswordValidator<AppUser> {
        public AppPasswordValidator(IdentityErrorDescriber errors = null) : base(errors) {
            
        }
    }

    public sealed class AppUserManager : UserManager<AppUser> {
        public AppUserManager(IUserStore<AppUser> store, IOptions<IdentityOptions> optionsAccessor, IPasswordHasher<AppUser> passwordHasher, IEnumerable<IUserValidator<AppUser>>  userValidators, IEnumerable<IPasswordValidator<AppUser>> passwordValidators, ILookupNormalizer keyNormalizer, IdentityErrorDescriber errors, IServiceProvider services, Microsoft.Extensions.Logging.ILogger<UserManager<AppUser>>  logger) : base(store, optionsAccessor, passwordHasher, userValidators, passwordValidators, keyNormalizer, errors, services, logger) {}

        public override async Task<IList<Claim>> GetClaimsAsync(AppUser user) {
            IList<Claim> claims = await base.GetClaimsAsync(user);

            claims.Add(new Claim("AppOwnerGroup", user.Group.Id.ToString(CultureInfo.InvariantCulture), typeof(Int32).FullName));

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
            return await this.Users.Where(x => x.Group.Id == id).ToListAsync();
        }
    }
}