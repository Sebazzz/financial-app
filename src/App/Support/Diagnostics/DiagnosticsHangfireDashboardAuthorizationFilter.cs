// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DiagnosticsHangfireDashboardAuthorizationFilter.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Diagnostics {
    using System;
    using Hangfire.Dashboard;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Options;
    using Models.Domain.Identity;

    public sealed class DiagnosticsHangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter {
        private readonly LocalRequestsOnlyAuthorizationFilter _localFilter = new LocalRequestsOnlyAuthorizationFilter();

        public bool Authorize(DashboardContext context) {
            if (this._localFilter.Authorize(context)) return true;

            if (context is AspNetCoreDashboardContext aspNetCoreContext) {
                return CheckIpAddress(context, aspNetCoreContext) || CheckAdministratorRole(aspNetCoreContext.HttpContext);
            }

            return false;
        }

        private static bool CheckAdministratorRole(HttpContext httpContext) {
            return httpContext.User.IsInRole(AppRole.KnownRoles.Administrator);
        }

        private static bool CheckIpAddress(DashboardContext context, AspNetCoreDashboardContext aspNetCoreContext) {
            var diagOptions = aspNetCoreContext.HttpContext.RequestServices
                .GetRequiredService<IOptionsSnapshot<DiagnosticsOptions>>();

            string[] ipAddresses = diagOptions.Value?.AllowedIPAddresses;
            return ipAddresses != null && Array.IndexOf(ipAddresses, context.Request.RemoteIpAddress) != -1;
        }
    }
}