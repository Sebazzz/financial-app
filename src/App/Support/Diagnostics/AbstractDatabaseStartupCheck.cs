// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AbstractDatabaseStartupCheck.cs
//  Project         : App
// ******************************************************************************

namespace App.Support.Diagnostics {
    using Microsoft.Extensions.Configuration;

    internal abstract class AbstractDatabaseStartupCheck : IStartupCheck {
        protected const string ConfigurationKey = "Data:AppDbConnection:ConnectionString";

        private readonly IConfiguration _configuration;

        protected AbstractDatabaseStartupCheck(IConfiguration configuration) {
            this._configuration = configuration;
        }

        protected string ConnectionString => this._configuration[ConfigurationKey];

        public abstract StartupCheckResult Run();

        public abstract string Description { get; }
    }
}