// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DatabaseOptions.cs
//  Project         : App
// ******************************************************************************
using System;

namespace App.Support
{
    using Microsoft.Data.SqlClient;

    public class DatabaseOptions
    {
        private string _cachedConnectionString;

        public string Server { get; set; }
        public string Database { get; set; }
        public string UserId { get; set; }
        public string Password { get; set; }
        public bool? Encrypt { get; set; }
        public bool? IntegratedSecurity { get; set; }
        public int? ConnectionTimeout { get; set; }

        public string ConnectionString { get; set; }

        public string CreateConnectionString()
        {
            if (this._cachedConnectionString != null)
            {
                return this._cachedConnectionString;
            }

            // Create new conn string
            var connStringBuilder = new SqlConnectionStringBuilder();

            // Set values current connection string
            if (this.ConnectionTimeout != null) connStringBuilder.ConnectTimeout = this.ConnectionTimeout.Value;
            if (this.Encrypt != null) connStringBuilder.Encrypt = this.Encrypt.Value;
            if (this.IntegratedSecurity != null) connStringBuilder.IntegratedSecurity = this.IntegratedSecurity.Value;
            if (!string.IsNullOrEmpty(this.UserId)) connStringBuilder.UserID = this.UserId;
            if (!string.IsNullOrEmpty(this.Password)) connStringBuilder.Password = this.Password;
            if (!string.IsNullOrEmpty(this.Server))connStringBuilder.DataSource = this.Server;
            if (!string.IsNullOrEmpty(this.Database))connStringBuilder.InitialCatalog = this.Database;

            // Copy current connection string, overriding options here
            if (!string.IsNullOrEmpty(this.ConnectionString))
            {
                var srcConnStringBuilder = new SqlConnectionStringBuilder(this.ConnectionString);
                foreach (string key in srcConnStringBuilder.Keys ?? throw new InvalidOperationException("Invalid connection string"))
                {
                    connStringBuilder[key] = srcConnStringBuilder[key];
                }
            }

            // Ensure MultipleActiveResultSets
            connStringBuilder.MultipleActiveResultSets = true;

            // Cache and return
            // (thread safety notice: assignment is atomic)
            return this._cachedConnectionString = connStringBuilder.ToString();
        }
    }
}
