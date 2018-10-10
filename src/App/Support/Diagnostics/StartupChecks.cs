// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : StartupChecks.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Diagnostics {
    using Microsoft.AspNetCore.Builder;
    using Microsoft.Extensions.DependencyInjection;

    internal static class StartupChecks {
        public static void AddStartupChecks(this IServiceCollection services) {
            services.AddTransient<IStartupCheck, DatabaseServerStartupCheck>();
            services.AddTransient<IStartupCheck, DatabaseStartupCheck>();
            services.AddTransient<IStartupCheck, MailStartupCheck>();

            services.AddTransient<StartupCheckRunner>();
        }

        public static bool RunStartupChecks(this IApplicationBuilder app) {
            var startupCheckRunner = app.ApplicationServices.GetRequiredService<StartupCheckRunner>();
            return startupCheckRunner.Run();
        }
    }
}