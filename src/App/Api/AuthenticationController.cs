using App.Support.Filters;

namespace App.Api {
    using System;
    using System.Linq;
    using System.Net;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Extensions;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Models.Domain.Identity;
    using Models.DTO;
    using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

    [Route("api/authentication")]
    public class AuthenticationController : Controller {
        private readonly SignInManager<AppUser> _authenticationManager;
        private readonly AppUserManager _appUserManager;
        public AuthenticationController(AppUserManager appUserManager, SignInManager<AppUser> authenticationManager) {
            this._appUserManager = appUserManager;
            this._authenticationManager = authenticationManager;
        }

        [HttpGet("check")]
        [AllowDuringSetup]
        public AuthenticationInfo CheckAuthentication() {
            return new AuthenticationInfo() {
                UserId = this.User.Identity.GetUserId(),
                UserName = this.User.Identity.Name,
                IsAuthenticated = this.User.Identity.IsAuthenticated,
                Roles = this.User.FindAll(ClaimTypes.Role).Select(x => x.Value).ToArray()
            };
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody]LoginModel parameters) {
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            AppUser user = await this._appUserManager.FindByNameAsync(parameters.UserName).EnsureNotNull(HttpStatusCode.Forbidden);

            SignInResult result = await this._authenticationManager.PasswordSignInAsync(user, parameters.Password, true, true);
            if (result.Succeeded == false) {
                return this.Ok(new AuthenticationInfo {
                    IsAuthenticated = false,
                    IsLockedOut = result.IsLockedOut,
                    IsTwoFactorAuthenticationRequired = result.RequiresTwoFactor
                });
            }

            return this.Ok(new AuthenticationInfo {
                IsAuthenticated = true,
                UserId = user.Id,
                UserName = user.UserName,
                Roles = await (await this._appUserManager.GetRolesAsync(user)).ToAsyncEnumerable().ToArray()
            });
        }

        [HttpPost("login-two-factor-authentication")]
        public async Task<IActionResult> LoginTwoFactorAuthentication([FromBody] LoginTwoFactorAuthenticationModel parameters) {
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            AppUser user = await this._authenticationManager.GetTwoFactorAuthenticationUserAsync();

            if (user == null)
            {
                return this.NotFound();
            }

            string code = parameters.VerificationCode?.Replace(" ", String.Empty).Replace("-", String.Empty);
            
            if (parameters.IsRecoveryCode) {
                var result = await this._authenticationManager.TwoFactorRecoveryCodeSignInAsync(code);
                
                if (!result.Succeeded) {
                    return this.Ok(new AuthenticationInfo {
                        IsAuthenticated = false,
                        IsLockedOut = result.IsLockedOut,
                        IsTwoFactorAuthenticationRequired = result.RequiresTwoFactor
                    });
                }
            } else {
                var result = await this._authenticationManager.TwoFactorAuthenticatorSignInAsync(code, true, parameters.RememberClient);

                if (!result.Succeeded) {
                    return this.Ok(new AuthenticationInfo {
                        IsAuthenticated = false,
                        IsLockedOut = result.IsLockedOut,
                        IsTwoFactorAuthenticationRequired = result.RequiresTwoFactor
                    });
                }
            }

            return this.Ok(new AuthenticationInfo {
                IsAuthenticated = true,
                UserId = user.Id,
                UserName = user.UserName,
                Roles = await (await this._appUserManager.GetRolesAsync(user)).ToAsyncEnumerable().ToArray()
            });
        }

        [HttpPost("logoff")]
        public async Task<AuthenticationInfo> LogOff() {
            await this._authenticationManager.SignOutAsync();

            return new AuthenticationInfo();
        }
    }
}
