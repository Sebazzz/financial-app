using App.Support.Filters;

namespace App.Api {
    using System;
    using System.Globalization;
    using System.Linq;
    using System.Net;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Extensions;
    using Microsoft.ApplicationInsights.AspNetCore.Extensions;
    using Microsoft.AspNetCore.Authentication;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Models.Domain;
    using Models.Domain.Identity;
    using Models.Domain.Services;
    using Models.DTO;
    using Support;
    using Support.Hub;
    using Support.Mailing;
    using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

    [Route("api/authentication")]
    public class AuthenticationController : Controller {
        private readonly SignInManager<AppUser> _authenticationManager;
        private readonly AppUserManager _appUserManager;

        private readonly ConfirmEmailMailer _confirmEmailMailer;
        private readonly ForgotPasswordMailer _forgotPasswordMailer;
        private readonly AppUserLoginEventService _appUserLoginEventService;

        public AuthenticationController(AppUserManager appUserManager, SignInManager<AppUser> authenticationManager, ConfirmEmailMailer confirmEmailMailer, ForgotPasswordMailer forgotPasswordMailer, AppUserLoginEventService appUserLoginEventService) {
            this._appUserManager = appUserManager;
            this._authenticationManager = authenticationManager;
            this._forgotPasswordMailer = forgotPasswordMailer;
            this._appUserLoginEventService = appUserLoginEventService;
            this._confirmEmailMailer = confirmEmailMailer;
        }

        [HttpGet("check")]
        [AllowDuringSetup]
        public async Task<AuthenticationInfo> CheckAuthentication() {
            AppUser user = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId()).EnsureNotNull(HttpStatusCode.Forbidden);

            return new AuthenticationInfo {
                UserId = this.User.Identity.GetUserId(),
                UserName = this.User.Identity.Name,
                CurrentGroupName = user.CurrentGroup.Name,
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

            await this._appUserLoginEventService.HandleUserLoginAsync(user, this.HttpContext);

            return await this.ReturnAuthenticationInfoResult(user);
        }

        [Authorize]
        [HttpPost("change-active-group")]
        public async Task<IActionResult> ChangeActiveGroup([FromBody] ChangeGroupModel changeGroupModel) {
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            ClaimsPrincipal principal = this.User;

            AppUser user = await this._appUserManager.FindByIdAsync(principal.Identity.GetUserId()).EnsureNotNull(HttpStatusCode.Forbidden);

            // Change the group and save
            AppUserAvailableGroup desiredGroup = user.AvailableGroups.FirstOrDefault(x => x.GroupId == changeGroupModel.GroupId).EnsureNotNull(HttpStatusCode.Forbidden);
            user.CurrentGroup = desiredGroup.Group;
            user.CurrentGroupId = desiredGroup.GroupId;

            await this._appUserManager.UpdateAsync(user);

            // Send new login token
            ClaimsIdentity identity = ((ClaimsIdentity) principal.Identity);
            identity.TryRemoveClaim(identity.FindFirst(AppClaimTypes.AppOwnerGroup));
            identity.AddClaim(new Claim(AppClaimTypes.AppOwnerGroup, user.CurrentGroupId.ToString(CultureInfo.InvariantCulture)));

            await this.HttpContext.SignInAsync(IdentityConstants.ApplicationScheme, principal);

            return await this.ReturnAuthenticationInfoResult(user);
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

            await this._appUserLoginEventService.HandleUserLoginAsync(user, this.HttpContext);

            return await this.ReturnAuthenticationInfoResult(user);
        }

        [HttpPost("logoff")]
        public async Task<AuthenticationInfo> LogOff() {
            await this._authenticationManager.SignOutAsync();

            return new AuthenticationInfo();
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel argument) {
            await Task.Delay(2000);
            
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            AppUser user = await this._appUserManager.FindByNameAsync(argument.User).EnsureNotNull(HttpStatusCode.Forbidden);

            if (String.IsNullOrEmpty(user.Email)) {
                this.ModelState.AddModelError(nameof(argument.User), "Je account heeft geen e-mail adres.");
                return this.BadRequest(this.ModelState);
            }

            string baseUrl = this.Request.GetUri().GetLeftPart(UriPartial.Authority);

            if (!user.EmailConfirmed) {
                this.ModelState.AddModelError(nameof(argument.User), "Het e-mail adres van je account is niet bevestigd. We hebben je een e-mail gestuurd om je e-mail adres te bevestigen. Hierna kan je het opnieuw proberen.");

                string confirmationToken = await this._appUserManager.GenerateEmailConfirmationTokenAsync(user);
                await this._confirmEmailMailer.SendAsync(user.Email, baseUrl, confirmationToken, user.UserName);

                return this.BadRequest(this.ModelState);
            }

            string resetToken = await this._appUserManager.GeneratePasswordResetTokenAsync(user);
            await this._forgotPasswordMailer.SendAsync(user.Email, baseUrl, resetToken);

            return this.NoContent();
        }

        [HttpPost("email-confirm")]
        public async Task<IActionResult> ConfirmEmail([FromBody] TokenModel token) {
            await Task.Delay(2000);
            
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            AppUser user = await this._appUserManager.FindByEmailAsync(token.Key).EnsureNotNull(HttpStatusCode.Forbidden);
            if (user.EmailConfirmed) {
                return this.Ok(new {ok = true});
            }

            IdentityResult result = await this._appUserManager.ConfirmEmailAsync(user, token.Token);
            if (!result.Succeeded) {
                this.ModelState.AppendIdentityResult(result, _ => nameof(token.Key));
                return this.BadRequest("Unknown token");
            }

            return this.Ok(new {ok = true});
        }

        [HttpPost("reset-password-validate")]
        public async Task<IActionResult> ResetPasswordValidate([FromBody] TokenModel token) {
            await Task.Delay(2000);
            
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            AppUser user = await this._appUserManager.FindByEmailAsync(token.Key).EnsureNotNull(HttpStatusCode.Forbidden);

            bool result = await this._appUserManager.VerifyResetTokenAsync(user, token.Token);
            if (!result) {
                return this.BadRequest("Unknown token");
            }

            return this.Ok(new {ok = true});
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel resetPasswordModel) {
            await Task.Delay(2000);
            
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            AppUser user = await this._appUserManager.FindByEmailAsync(resetPasswordModel.Key).EnsureNotNull(HttpStatusCode.Forbidden);

            {
                IdentityResult result = await this._appUserManager.ResetPasswordAsync(user, resetPasswordModel.Token, resetPasswordModel.NewPassword);
                if (!result.Succeeded) {
                    this.ModelState.AppendIdentityResult(result, _ => nameof(resetPasswordModel.NewPassword));
                    return this.BadRequest(this.ModelState);
                }
            }

            {
                IdentityResult result = await this._appUserManager.UpdateSecurityStampAsync(user);
                if (!result.Succeeded) {
                    this.ModelState.AppendIdentityResult(result, _ => nameof(resetPasswordModel.NewPassword));
                    return this.BadRequest(this.ModelState);
                }
            }

            return this.NoContent();
        }

        private async Task<OkObjectResult> ReturnAuthenticationInfoResult(AppUser user) {
            return this.Ok(new AuthenticationInfo {
                IsAuthenticated = true,
                CurrentGroupName = user.CurrentGroup.Name,
                UserId = user.Id,
                UserName = user.UserName,
                Roles = await (await this._appUserManager.GetRolesAsync(user)).ToAsyncEnumerable().ToArray()
            });
        }
    }
}
