// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : StartupCheckRunner.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Diagnostics {
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;

    internal sealed class StartupCheckRunner {
        private readonly IHostApplicationLifetime _appLifetime;
        private readonly ILogger<StartupCheckRunner> _logger;
        private readonly List<IStartupCheck> _startupChecks;

        public StartupCheckRunner(IHostApplicationLifetime appLifetime, ILogger<StartupCheckRunner> logger,
            IEnumerable<IStartupCheck> startupChecks) {
            this._appLifetime = appLifetime;
            this._logger = logger;
            this._startupChecks = startupChecks.ToList();
        }

        public bool Run() {
            using (this._logger.BeginScope("Running {0} pre-flight health checks", this._startupChecks.Count)) {
                foreach (var startupCheck in this._startupChecks) {
                    var success = this.RunStartupCheck(startupCheck);

                    if (!success) {
                        this._logger.LogWarning("Startup check failed. Requesting server shutdown.");
                        this._appLifetime.StopApplication();

                        Environment.ExitCode = -1;
                        return false;
                    }
                }
            }

            return true;
        }

        private bool RunStartupCheck(IStartupCheck startupCheck) {
            this._logger.LogInformation("Running check: {0}", startupCheck.Description);

            StartupCheckResult result;
            try {
                result = startupCheck.Run();
            }
            catch (Exception ex) {
                this._logger.LogCritical(ex, "\tStartup check failed due to unknown reason.");
                return false;
            }

            if (result.IsSuccess) {
                this._logger.LogInformation("\t{0}", result.Message ?? "Success");
                return true;
            }

            this._logger.LogError(result.Exception, result.Message);
            return false;
        }
    }
}
