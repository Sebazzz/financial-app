// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppInsightsHangfireJobFilter.cs
//  Project         : App
// ******************************************************************************
using System;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;

namespace App.Support.Diagnostics
{
    public class AppInsightsJobFilterAttribute : JobFilterAttribute, IElectStateFilter
    {
        private readonly TelemetryClient _telemetryClient;

        /// <inheritdoc />
        public AppInsightsJobFilterAttribute(TelemetryClient telemetryClient)
        {
            this._telemetryClient = telemetryClient;
        }

        /// <inheritdoc />
        public void OnStateElection(ElectStateContext context)
        {
            if (context.CandidateState is FailedState failedState) {
                this._telemetryClient.TrackException(new ExceptionTelemetry(failedState.Exception)
                {
                    Message = $"Job `{context.BackgroundJob.Id}` has been failed due to an exception `{failedState.Exception}`",
                    SeverityLevel = SeverityLevel.Error
                });
            }
        }

        public static void Register(TelemetryClient telemetryClient)
        {
            if (telemetryClient == null)
            {
                return;
            }

            GlobalJobFilters.Filters.Add(new AppInsightsJobFilterAttribute(telemetryClient));
        }
    }
}