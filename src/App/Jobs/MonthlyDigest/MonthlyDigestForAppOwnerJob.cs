// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : MonthlyDigestForAppOwnerJob.cs
//  Project         : App
// ******************************************************************************
namespace App.Jobs.MonthlyDigest {
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.Linq;
    using System.Threading.Tasks;
    using Hangfire;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Models.Domain;
    using Models.Domain.Identity;
    using Models.Domain.Repositories;

    /// <summary>
    ///     This jobs sends a weekly digest for the specified app owner group
    /// </summary>
    public sealed class MonthlyDigestForAppOwnerJob {
        private readonly AppOwnerRepository _appOwnerRepository;
        private readonly AppUserManager _appUserManager;

        private readonly MonthlyDigestDataFactory _monthlyDigestDataFactory;
        private readonly MonthlyDigestMailer _monthlyDigestMailer;

        private readonly ILogger<MonthlyDigestForAppOwnerJob> _logger;

        public MonthlyDigestForAppOwnerJob(AppOwnerRepository appOwnerRepository, AppUserManager appUserManager, MonthlyDigestDataFactory monthlyDigestDataFactory, MonthlyDigestMailer monthlyDigestMailer, ILogger<MonthlyDigestForAppOwnerJob> logger) {
            this._appOwnerRepository = appOwnerRepository;
            this._appUserManager = appUserManager;
            this._logger = logger;
            this._monthlyDigestDataFactory = monthlyDigestDataFactory;
            this._monthlyDigestMailer = monthlyDigestMailer;
        }

        [AutomaticRetry(Attempts = 2)]
        public async Task Execute(int appOwnerId) {
            // Set a culture, we currently only support hardcoded NL
            CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo("nl-NL");

            // Retrieve the user
            AppOwner appOwner = await this._appOwnerRepository.FindByIdAsync(appOwnerId);
            if (appOwner == null) {
                this._logger.LogError($"Unable to process job for app owner #{appOwnerId}: entity cannot be found");
                return;
            }

            // We only want to invoke if we have not sent a digest about last month
            DateTime invocationThreshold = DateTime.Now.AddMonths(-1);
            invocationThreshold = new DateTime(invocationThreshold.Year, invocationThreshold.Month, 1);

            if (appOwner.LastMonthlyDigestTimestamp >= invocationThreshold) {
                this._logger.LogWarning($"Not going to process job for app owner #{appOwnerId}: app owner group has already been sent a digest (possible race condition?)");
                return;
            }

            var users = await this._appUserManager.Users.Where(u => u.AvailableGroups.Any(g => g.GroupId == appOwnerId)  && u.Preferences.EnableMonthlyDigest).ToListAsync();
            if (users.Count == 0) {
                this._logger.LogInformation($"Not going to process job for app owner #{appOwnerId}: no users want to receive the monthly digest");
                return;
            }

            this._logger.LogInformation($"Starting job for app owner #{appOwnerId}: Sent digest to {users.Count} users");

            await this.SendDigestInternal(appOwner, users);

            this._logger.LogInformation($"Completed job for app owner #{appOwnerId}: Sent digest to {users.Count} users");

            appOwner.LastMonthlyDigestTimestamp = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
            await this._appOwnerRepository.SaveChangesAsync();
        }

        private async Task SendDigestInternal(AppOwner appOwner, List<AppUser> users) {
            MonthlyDigestData data = await this._monthlyDigestDataFactory.GetForAsync(appOwner.Id);
            data.AppOwnerName = appOwner.Name;

            foreach (AppUser appUser in users) {
                if (!appUser.EmailConfirmed) {
                    this._logger.LogWarning($"Job for app owner #{appOwner.Id}: skip digest for {appUser.UserName} #{appUser.Id} because the e-mail address is not valid or confirmed [{appUser.Email}]");
                    continue;
                }

                await this._monthlyDigestMailer.SendAsync(appUser.Email, data);
            }
        }
    }
}
