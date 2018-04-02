// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AccountController.cs
//  Project         : App
// ******************************************************************************

using System;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using App.Api.Extensions;
using App.Models.Domain.Identity;
using App.Models.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QRCoder;
using static QRCoder.PayloadGenerator;
using static QRCoder.PayloadGenerator.OneTimePassword;

namespace App.Api
{
    [Route("api/account")]
    [Authorize]
    public class AccountController : Controller
    {
        private readonly AppUserManager _appUserManager;
        private readonly AppOwnerRepository _appOwnerRepository;

        /// <inheritdoc />
        public AccountController(AppUserManager appUserManager, AppOwnerRepository appOwnerRepository)
        {
            this._appUserManager = appUserManager;
            this._appOwnerRepository = appOwnerRepository;
        }

        [HttpGet("my-info")]
        public async Task<IActionResult> MyInfo()
        {
            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId());

            if (currentUser == null)
            {
                return this.NotFound();
            }

            // Fix not lazily loaded property
            currentUser.Group = await this._appOwnerRepository.FindByIdAsync(currentUser.GroupId);

            return this.Ok(new
            {
                UserName = currentUser.UserName,
                Email = currentUser.Email,
                GroupName = currentUser.Group?.Name,

                TwoFactorAuthentication = new {
                    IsEnabled = await this._appUserManager.GetTwoFactorEnabledAsync(currentUser),
                    IsAuthenticatorAppEnabled = (await this._appUserManager.GetAuthenticatorKeyAsync(currentUser)) != null
                },
            });
        }

        [HttpPost("two-factor-authentication/pre-enable")]
        public async Task<IActionResult> PreEnable() {
            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId());
            string key = await this.GetTwoFactorKeyAsync(currentUser);

            return this.Ok(new {
                QrCode = CreateBase64QRCode(key, currentUser),
                SecretKey = FormatKey(key)
            });
        }

        [HttpPost("two-factor-authentication")]
        public async Task<IActionResult> Enable([FromBody] TwoFactorAuthenticationEnableInfo input) {
            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId());
            
            string token = input.VerificationCode?.Replace("-", "").Replace(" ", "");
            if (String.IsNullOrEmpty(token)) {
                this.ModelState.AddModelError(nameof(input.VerificationCode), "Missing verification code");
                return this.BadRequest(this.ModelState);
            }
            
            bool isVerified = await this._appUserManager.VerifyTwoFactorTokenAsync(currentUser, this._appUserManager.Options.Tokens.AuthenticatorTokenProvider, token);
            if (!isVerified) {
                this.ModelState.AddModelError(nameof(input.VerificationCode), "Invalid verification code");
                return this.BadRequest(this.ModelState);
            }

            await this._appUserManager.SetTwoFactorEnabledAsync(currentUser, true);
            string[] recoveryCodes = (await this._appUserManager.GenerateNewTwoFactorRecoveryCodesAsync(currentUser, 10)).ToArray();

            return this.Ok(new {
                RecoveryCodes = recoveryCodes
            });
        }

        [HttpDelete("two-factor-authentication")]
        public async Task<IActionResult> Disable(){
            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId());
            await this._appUserManager.SetTwoFactorEnabledAsync(currentUser, false);
            return this.NoContent();
        }

        private static string CreateBase64QRCode(string key, AppUser user) {
            OneTimePassword qrPayload = new OneTimePassword {
                Issuer = "Financial App",
                Secret = key,
                Type = OneTimePasswordAuthType.TOTP,
                Label = user.UserName
            };

            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            QRCodeData qrCodeData = qrGenerator.CreateQrCode(qrPayload.ToString(), QRCodeGenerator.ECCLevel.L);

            Base64QRCode qrCode = new Base64QRCode(qrCodeData);

            return qrCode.GetGraphic(10);
        }

        private async Task<string> GetTwoFactorKeyAsync(AppUser user) {
            await this._appUserManager.ResetAuthenticatorKeyAsync(user);
            return await this._appUserManager.GetAuthenticatorKeyAsync(user);
        }

        private string FormatKey(string unformattedKey)
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
        public class TwoFactorAuthenticationEnableInfo {
            [DataMember(Name="verificationCode")]
            public string VerificationCode { get;set; }
        }
    }
}