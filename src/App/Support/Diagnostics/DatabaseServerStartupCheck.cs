// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DatabaseServerStartupCheck.cs
//  Project         : App
// ******************************************************************************
using Microsoft.Extensions.Options;

namespace App.Support.Diagnostics {
    using System;
    using System.Diagnostics;
    using Microsoft.Data.SqlClient;
    using Microsoft.Extensions.Configuration;

    internal sealed class DatabaseServerStartupCheck : AbstractDatabaseStartupCheck {
        public DatabaseServerStartupCheck(IOptions<DatabaseOptions> configuration) : base(configuration) { }

        public override string Description => "Check connection to SQL server";

        public override StartupCheckResult Run() {
            var connectionString = this.ConnectionString;
            if (string.IsNullOrEmpty(connectionString))
                return StartupCheckResult.Failure(
                    $"Connection string is null or empty. Use configuration path 'Database' to configure the connection string.");

            // Even if the database does not exist, connection to master should always succeed
            var connectionStringBuilder = new SqlConnectionStringBuilder(connectionString);
            connectionStringBuilder.InitialCatalog = "master";

            var sw = new Stopwatch();
            sw.Start();

            try {
                using (var conn = new SqlConnection(connectionStringBuilder.ToString())) {
                    conn.Open();

                    conn.Close();
                }
            }
            catch (Exception ex) {
                return StartupCheckResult.Failure(
                    $"Unable to connect to database server {connectionStringBuilder.DataSource} using connection string: [{connectionStringBuilder}]",
                    ex);
            }
            finally {
                sw.Stop();
            }

            return StartupCheckResult.Success($"Connected to {connectionStringBuilder.DataSource} in {sw.Elapsed:g}");
        }
    }
}
