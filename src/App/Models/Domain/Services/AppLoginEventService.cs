// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppLoginEventService.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Services
{
    using System;
    using System.Threading.Tasks;
    using Identity;
    using Microsoft.AspNetCore.DataProtection;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Logging;
    using Repositories;
    using Support.Mailing;

    public sealed class AppUserLoginEventService
    {
        private const string MachineIdentificationCookie = nameof(MachineIdentificationCookie);
        private const string EncryptionPurpose = nameof(MachineIdentificationCookie);

        private readonly AppUserLoginEventRepository _appUserLoginEventRepository;
        private readonly AppUserLoginEventMailer _appUserLoginEventMailer;
        private readonly IDataProtector _dataProtector;
        private readonly ILogger<AppUserLoginEventService> _logger;

        public AppUserLoginEventService(AppUserLoginEventRepository appUserLoginEventRepository, IDataProtectionProvider dataProtector, AppUserLoginEventMailer appUserLoginEventMailer, ILogger<AppUserLoginEventService> logger)
        {
            this._appUserLoginEventRepository = appUserLoginEventRepository;
            this._dataProtector = dataProtector.CreateProtector(EncryptionPurpose);
            this._appUserLoginEventMailer = appUserLoginEventMailer;
            this._logger = logger;
        }

        public async Task HandleUserLoginAsync(AppUser user, HttpContext httpContext)
        {
            try
            {
                await this.HandleLoginCore(user, httpContext);
            }
            catch (Exception ex)
            {
                this._logger.LogError(ex, $"Encountered error while saving login for user: {user.UserName} [#{user.Id}]");
            }
        }

        private async Task HandleLoginCore(AppUser user, HttpContext httpContext)
        {
            if (this.HasTrustedCookie(user, httpContext.Request))
            {
                this._logger.LogInformation($"User #{user.Id} logs in with a trusted cookie");

                // Refresh cookie
                this.SetTrustedResponseCookie(user, httpContext);
                return;
            }

            string ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
            if (String.IsNullOrEmpty(ipAddress))
            {
                this._logger.LogWarning($"User #{user.Id} logs in - no IP address???");
                return;
            }

            string userAgent = httpContext.Request.Headers["User-Agent"];
            if (await this.ExistsInDatabase(ipAddress, userAgent, user.Id))
            {
                this._logger.LogInformation($"User #{user.Id} logs in, based on IP address [{ipAddress}] and user agent [{userAgent}] this login is trusted");

                // Refresh cookie
                this.SetTrustedResponseCookie(user, httpContext);
                return;
            }

            var loginEvent = new AppUserLoginEvent
            {
                IPAddress = ipAddress,
                UserAgent = userAgent,
                Timestamp = DateTime.Now,
                User = user,
                UserId = user.Id
            };

            this._appUserLoginEventRepository.Add(loginEvent);
            await this._appUserLoginEventRepository.SaveChangesAsync();

            this.SetTrustedResponseCookie(user, httpContext);

            this._logger.LogInformation($"User #{user.Id} logs in, based on IP address [{ipAddress}] and user agent [{userAgent}] this login is new");

            if (user.Preferences.EnableLoginNotifications && user.EmailConfirmed)
            {
                this._logger.LogInformation($"User #{user.Id} logs in, sending notification for new login");

                await this._appUserLoginEventMailer.SendAsync(loginEvent);
            }
        }

        private void SetTrustedResponseCookie(AppUser user, HttpContext httpContext)
        {
            string securityKey = user.SecurityStamp;
            string encryptedSecurityKey = this._dataProtector.Protect(securityKey);

            var cookieOptions = new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddDays(365),
                HttpOnly = true,
                Secure = httpContext.Request.IsHttps
            };
            httpContext.Response.Cookies.Append(MachineIdentificationCookie, encryptedSecurityKey, cookieOptions);
        }

        private bool HasTrustedCookie(AppUser user, HttpRequest httpRequest)
        {
            if (!httpRequest.Cookies.TryGetValue(MachineIdentificationCookie, out string encodedCookieContents) || String.IsNullOrEmpty(encodedCookieContents))
            {
                return false;
            }

            string securityKey = this._dataProtector.Unprotect(encodedCookieContents);
            string userSecurityKey = user.SecurityStamp;

            return String.Equals(securityKey, userSecurityKey, StringComparison.OrdinalIgnoreCase);
        }

        private async Task<bool> ExistsInDatabase(string ipAddress, string userAgent, int userId)
        {
            return await this._appUserLoginEventRepository.GetByKeyAsync(userId, ipAddress, userAgent) != null;
        }
    }
}