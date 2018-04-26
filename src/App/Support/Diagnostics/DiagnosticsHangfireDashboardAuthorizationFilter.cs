// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DiagnosticsHangfireDashboardAuthorizationFilter.cs
//  Project         : App
// ******************************************************************************

namespace App.Support.Diagnostics {
    using System;
    using Hangfire.Dashboard;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Options;

    public sealed class DiagnosticsHangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter {
        private readonly LocalRequestsOnlyAuthorizationFilter _localFilter = new LocalRequestsOnlyAuthorizationFilter();

        public bool Authorize(DashboardContext context) {
            if (this._localFilter.Authorize(context)) return true;

            if (context is AspNetCoreDashboardContext aspNetCoreContext) {
                var diagOptions = aspNetCoreContext.HttpContext.RequestServices
                    .GetRequiredService<IOptionsSnapshot<DiagnosticsOptions>>();

                var ipAddresses = diagOptions.Value?.AllowedIPAddresses;
                return ipAddresses != null && Array.IndexOf(ipAddresses, context.Request.RemoteIpAddress) != -1;
            }

            return false;
        }
    }
}