// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : UserManagerExtensions.cs
//  Project         : App
// ******************************************************************************
namespace App.Support {
    using System.Threading.Tasks;
    using Models.Domain.Identity;

    public static class UserManagerExtensions {
        public static Task<bool> VerifyResetTokenAsync(this AppUserManager userManager, AppUser user, string token) {
            return userManager.VerifyUserTokenAsync(user, userManager.Options.Tokens.PasswordResetTokenProvider, "ResetPassword", token);
        }
    }
}