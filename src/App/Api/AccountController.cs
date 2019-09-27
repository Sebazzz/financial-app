// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AccountController.cs
//  Project         : App
// ******************************************************************************
namespace App.Api
{
    using System;
    using System.Linq;
    using System.Runtime.Serialization;
    using System.Text;
    using System.Threading.Tasks;
    using App.Api.Extensions;
    using App.Models.Domain.Identity;
    using App.Models.Domain.Repositories;
    using App.Models.DTO;
    using App.Support;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using QRCoder;
    using static QRCoder.PayloadGenerator;
    using static QRCoder.PayloadGenerator.OneTimePassword;

    using System.Net;
    using AutoMapper;

    [Route("api/account")]
    [Authorize]
    public class AccountController : Controller
    {
        private readonly AppUserManager _appUserManager;
        private readonly AppUserLoginEventRepository _appUserLoginEventRepository;
        private readonly IMapper _mapper;

        /// <inheritdoc />
        public AccountController(AppUserManager appUserManager, IMapper mapper, AppUserLoginEventRepository appUserLoginEventRepository)
        {
            this._appUserManager = appUserManager;
            this._mapper = mapper;
            this._appUserLoginEventRepository = appUserLoginEventRepository;
        }

        [HttpGet("my-info")]
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Style", "IDE0046:Convert to conditional expression", Justification = "<Pending>")]
        public async Task<IActionResult> MyInfo()
        {
            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId()).EnsureNotNull(HttpStatusCode.Unauthorized);

            if (currentUser == null)
            {
                return this.NotFound();
            }

            return this.Ok(new
            {
                UserName = currentUser.UserName,
                Email = currentUser.Email,
                EmailConfirmed = currentUser.EmailConfirmed,

                CurrentGroupId = currentUser.CurrentGroupId,
                CurrentGroupName = currentUser.CurrentGroup?.Name,
                AvailableGroups = (
                    (
                        from g in currentUser.AvailableGroups
                        select new {
                            Id = g.GroupId,
                            Name = g.Group.Name
                        }
                    ).Concat(
                        from imp in currentUser.AvailableImpersonations
                        where imp.IsActive
                        select new {
                            Id = imp.Group.Id,
                            Name = imp.Group.Name
                        }
                    ).Distinct()
                ),

                TwoFactorAuthentication = new
                {
                    IsEnabled = await this._appUserManager.GetTwoFactorEnabledAsync(currentUser),
                    IsAuthenticatorAppEnabled = (await this._appUserManager.GetAuthenticatorKeyAsync(currentUser)) != null,
                    RecoveryCodeCount = await this._appUserManager.CountRecoveryCodesAsync(currentUser)
                },

                LastLoginEvents = (
                    from ev in this._appUserLoginEventRepository.GetByUser(currentUser.Id).Take(5)
                    select new
                    {
                        ev.IPAddress,
                        ev.UserAgent,
                        ev.Timestamp
                    }
                )
            });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel input)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId()).EnsureNotNull(HttpStatusCode.Unauthorized);
            IdentityResult result = await this._appUserManager.ChangePasswordAsync(currentUser, input.CurrentPassword, input.NewPassword);

            if (!result.Succeeded)
            {
                this.ModelState.AppendIdentityResult(result, _ => nameof(input.NewPassword));
                return this.BadRequest(this.ModelState);
            }

            return this.NoContent();
        }

        [HttpPost("two-factor-authentication/pre-enable")]
        public async Task<IActionResult> PreEnable()
        {
            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId()).EnsureNotNull(HttpStatusCode.Unauthorized);
            string key = await this.GetTwoFactorKeyAsync(currentUser);

            return this.Ok(new
            {
                QrCode = CreateBase64QRCode(key, currentUser),
                SecretKey = FormatKey(key)
            });
        }

        [HttpPost("two-factor-authentication/reset-recovery-keys")]
        public async Task<IActionResult> ResetRecoveryKeys()
        {
            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId()).EnsureNotNull(HttpStatusCode.Unauthorized);

            string[] recoveryCodes = (await this._appUserManager.GenerateNewTwoFactorRecoveryCodesAsync(currentUser, 10)).ToArray();

            return this.Ok(new
            {
                RecoveryCodes = recoveryCodes
            });
        }

        [HttpPost("two-factor-authentication")]
        public async Task<IActionResult> Enable([FromBody] TwoFactorAuthenticationEnableInfo input)
        {
            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId()).EnsureNotNull(HttpStatusCode.Unauthorized);

            string token = input.VerificationCode?.Replace("-", "").Replace(" ", "");
            if (String.IsNullOrEmpty(token))
            {
                this.ModelState.AddModelError(nameof(input.VerificationCode), "Missing verification code");
                return this.BadRequest(this.ModelState);
            }

            bool isVerified = await this._appUserManager.VerifyTwoFactorTokenAsync(currentUser, this._appUserManager.Options.Tokens.AuthenticatorTokenProvider, token);
            if (!isVerified)
            {
                this.ModelState.AddModelError(nameof(input.VerificationCode), "Invalid verification code");
                return this.BadRequest(this.ModelState);
            }

            await this._appUserManager.SetTwoFactorEnabledAsync(currentUser, true);
            string[] recoveryCodes = (await this._appUserManager.GenerateNewTwoFactorRecoveryCodesAsync(currentUser, 10)).ToArray();

            return this.Ok(new
            {
                RecoveryCodes = recoveryCodes
            });
        }

        [HttpDelete("two-factor-authentication")]
        public async Task<IActionResult> Disable()
        {
            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId()).EnsureNotNull(HttpStatusCode.Unauthorized);
            await this._appUserManager.SetTwoFactorEnabledAsync(currentUser, false);
            return this.NoContent();
        }

        [HttpGet("preferences")]
        public async Task<PreferencesModel> GetPreferences()
        {
            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId());

            return this._mapper.Map<PreferencesModel>(currentUser.Preferences);
        }

        [HttpPut("preferences")]
        public async Task<IActionResult> SetPreferences([FromBody] PreferencesModel preferences)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId());

            this._mapper.Map(preferences, currentUser.Preferences);

            await this._appUserManager.UpdateAsync(currentUser);

            return this.NoContent();
        }

        private static string CreateBase64QRCode(string key, AppUser user)
        {
            var qrPayload = new OneTimePassword
            {
                Issuer = "Financial App",
                Secret = key,
                Type = OneTimePasswordAuthType.TOTP,
                Label = user.UserName
            };

            var qrGenerator = new QRCodeGenerator();
            QRCodeData qrCodeData = qrGenerator.CreateQrCode(qrPayload.ToString(), QRCodeGenerator.ECCLevel.L);

            var qrCode = new Base64QRCode(qrCodeData);

            return qrCode.GetGraphic(5);
        }

        private async Task<string> GetTwoFactorKeyAsync(AppUser user)
        {
            await this._appUserManager.ResetAuthenticatorKeyAsync(user);
            return await this._appUserManager.GetAuthenticatorKeyAsync(user);
        }

        private static string FormatKey(string unformattedKey)
        {
            var result = new StringBuilder();
            int currentPosition = 0;
            while (currentPosition + 4 < unformattedKey.Length)
            {
                result.Append(unformattedKey.Substring(currentPosition, 4)).Append(" ");
                currentPosition += 4;
            }
            if (currentPosition < unformattedKey.Length)
            {
                result.Append(unformattedKey.Substring(currentPosition));
            }

            return result.ToString().ToLowerInvariant();
        }

        [DataContract]
        public class TwoFactorAuthenticationEnableInfo
        {
            [DataMember(Name = "verificationCode")]
            public string VerificationCode { get; set; }
        }
    }
}
