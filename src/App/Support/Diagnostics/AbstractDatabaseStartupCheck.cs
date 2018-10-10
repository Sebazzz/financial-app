// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AbstractDatabaseStartupCheck.cs
//  Project         : App
// ******************************************************************************
using Microsoft.Extensions.Options;

namespace App.Support.Diagnostics {
    using Microsoft.Extensions.Configuration;

    internal abstract class AbstractDatabaseStartupCheck : IStartupCheck {
        private readonly IOptions<DatabaseOptions> _configuration;

        protected AbstractDatabaseStartupCheck(IOptions<DatabaseOptions> configuration) {
            this._configuration = configuration;
        }


        protected DatabaseOptions DatabaseOptions => this._configuration.Value;

        protected string ConnectionString => this.DatabaseOptions.CreateConnectionString();

        public abstract StartupCheckResult Run();

        public abstract string Description { get; }
    }
}