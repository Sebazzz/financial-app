// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : MonthlyDigestInvocationJob.cs
//  Project         : App
// ******************************************************************************
namespace App.Jobs.MonthlyDigest
{
    using System;
    using System.Linq;
    using Hangfire;
    using Microsoft.Extensions.Logging;
    using Models.Domain;
    using Models.Domain.Repositories;

    /// <summary>
    /// This job adds a job for each app owner to send the weekly digest
    /// </summary>
    public class MonthlyDigestInvocationJob
    {
        private readonly AppOwnerRepository _appOwnerRepository;
        private readonly IBackgroundJobClient _backgroundJobClient;

        private readonly ILogger<MonthlyDigestInvocationJob> _logger;

        public MonthlyDigestInvocationJob(AppOwnerRepository appOwnerRepository, IBackgroundJobClient backgroundJobClient, ILogger<MonthlyDigestInvocationJob> logger)
        {
            this._appOwnerRepository = appOwnerRepository;
            this._backgroundJobClient = backgroundJobClient;
            this._logger = logger;
        }

        public void Execute()
        {
            // Round off to one month
            DateTime invocationThreshold = DateTime.Now.AddMonths(-1);
            invocationThreshold = new DateTime(invocationThreshold.Year, invocationThreshold.Month, 1);

            this._logger.LogInformation($"Checking whether we need to send the monthly digest. Filtering on timestamp smaller then {invocationThreshold}.");
            IQueryable<AppOwner> allAppOwners = this._appOwnerRepository.GetAll().Where(x => x.LastMonthlyDigestTimestamp < invocationThreshold);

            foreach (AppOwner appOwner in allAppOwners)
            {
                int appOwnerId = appOwner.Id;

                this._logger.LogInformation($"Invoking {nameof(MonthlyDigestForAppOwnerJob)} for app owner #{appOwnerId}");
                this._backgroundJobClient.Enqueue<MonthlyDigestForAppOwnerJob>(x => x.Execute(appOwnerId));
            }
        }
    }
}