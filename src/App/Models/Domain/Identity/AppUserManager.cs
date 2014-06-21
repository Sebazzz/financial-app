namespace App.Models.Domain.Identity {
    using System;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using Microsoft.AspNet.Identity.Owin;
    using Microsoft.Owin;

    public sealed class AppUserManager : UserManager<AppUser, int> {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="store">The IUserStore is responsible for commiting changes via the UpdateAsync/CreateAsync methods</param>
        public AppUserManager(IUserStore<AppUser, int> store) : base(store) {
            
        }

        public static AppUserManager Create(IdentityFactoryOptions<AppUserManager> options, IOwinContext context) {
            var manager = new AppUserManager(new AppUserStore(context.Get<AppDbContext>()));
            // Configure validation logic for usernames
            manager.UserValidator = new UserValidator<AppUser,int>(manager) {
                AllowOnlyAlphanumericUserNames = false,
                RequireUniqueEmail = true
            };
            // Configure validation logic for passwords
            manager.PasswordValidator = new PasswordValidator {
                RequiredLength = 8,
                RequireNonLetterOrDigit = false,
                RequireDigit = false,
                RequireLowercase = false,
                RequireUppercase = false,
            };
            var dataProtectionProvider = options.DataProtectionProvider;
            if (dataProtectionProvider != null) {
                manager.UserTokenProvider = new DataProtectorTokenProvider<AppUser,int>(dataProtectionProvider.Create("FinancialApp"));
            }
            return manager;
        }

        internal async System.Threading.Tasks.Task<IdentityResult> ChangePasswordAsync(int userId, string newPassword) {
            AppUser user = await this.FindByIdAsync(userId).ConfigureAwait(false);
            if (user == null) {
                throw new InvalidOperationException("user not found");
            }

            IdentityResult result = await this.PasswordValidator.ValidateAsync(newPassword).ConfigureAwait(false);
            
            IUserPasswordStore<AppUser, int> pwdStore = (IUserPasswordStore<AppUser, int>) this.Store;
            if (result.Succeeded) await pwdStore.SetPasswordHashAsync(user, newPassword).ConfigureAwait(false);
            if (result.Succeeded) result = await this.UpdateSecurityStampAsync(user.Id);
            if (result.Succeeded) result = await this.UpdateAsync(user);

            return result;
        }
    }
}