// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DatabaseStartupCheck.cs
//  Project         : App
// ******************************************************************************
using Microsoft.Extensions.Options;

namespace App.Support.Diagnostics {
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using Dapper;
    using Microsoft.Data.SqlClient;
    using Microsoft.Extensions.Configuration;

    internal sealed class DatabaseStartupCheck : AbstractDatabaseStartupCheck {
        public DatabaseStartupCheck(IOptions<DatabaseOptions> configuration) : base(configuration) { }

        public override string Description => "Check connection to database";

        public override StartupCheckResult Run() {
            var connectionString = this.ConnectionString;
            if (string.IsNullOrEmpty(connectionString))
                return StartupCheckResult.Failure(
                    "Connection string is null or empty. Use configuration path 'Database' to configure the connection string.");

            // Even if the database does not exist, connection to master should always succeed
            var connectionStringBuilder = new SqlConnectionStringBuilder(connectionString);

            var sw = new Stopwatch();
            sw.Start();

            try {
                var requiredPermissions = new HashSet<string>(new[] {
                    "ALTER",
                    "SELECT",
                    "INSERT",
                    "DELETE",
                    "UPDATE",
                    "EXECUTE"
                });

                using (var conn = new SqlConnection(connectionStringBuilder.ToString())) {
                    conn.Open();

                    var q = conn.Query(
                        @"SELECT permission_name AS PermissionName FROM fn_my_permissions(NULL, 'DATABASE') ORDER BY permission_name");
                    foreach (var item in q) requiredPermissions.Remove(item.PermissionName);

                    if (requiredPermissions.Count > 0)
                        return StartupCheckResult.Failure(
                            $"Database {connectionStringBuilder.InitialCatalog} on {connectionStringBuilder.DataSource}: Missing permissions [{string.Join(",", requiredPermissions)}]",
                            null);

                    conn.Close();
                }
            }
            catch (Exception ex) {
                return StartupCheckResult.Failure(
                    $"Database does not appear to exist. Unable to connect to database {connectionStringBuilder.InitialCatalog} on {connectionStringBuilder.DataSource} using connection string: [{connectionStringBuilder}]",
                    ex);
            }
            finally {
                sw.Stop();
            }

            return StartupCheckResult.Success(
                $"Connected to {connectionStringBuilder.InitialCatalog} on {connectionStringBuilder.DataSource} in {sw.Elapsed:g}");
        }
    }
}
