// ******************************************************************************
//  © 2019 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Class.cs
//  Project         : App
// ******************************************************************************

namespace App.Support
{
    using System;
    using System.Data.Common;
    using Microsoft.Data.SqlClient;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.SqlServer.Storage.Internal;
    using Microsoft.EntityFrameworkCore.Storage;

    /// <summary>
    ///     This API supports the Entity Framework Core infrastructure.
    /// </summary>
    public sealed class SqlServerConnection : RelationalConnection, ISqlServerConnection
    {
        // Compensate for slow SQL Server database creation
        private const Int32 DefaultMasterConnectionCommandTimeout = 60;
        private Boolean? _multipleActiveResultSetsEnabled;

        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public SqlServerConnection(RelationalConnectionDependencies dependencies)
            : base(dependencies: dependencies)
        {
        }

        /// <summary>
        ///     Indicates whether the store connection supports ambient transactions
        /// </summary>
        protected override Boolean SupportsAmbientTransactions => true;

        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public ISqlServerConnection CreateMasterConnection()
        {
            var connectionStringBuilder = new SqlConnectionStringBuilder(connectionString: this.ConnectionString)
            {
                InitialCatalog = "master"
            };
            connectionStringBuilder.Remove(keyword: "AttachDBFilename");

            DbContextOptions contextOptions = new DbContextOptionsBuilder().UseSqlServer(
                    connectionString: connectionStringBuilder.ConnectionString,
                    sqlServerOptionsAction: b =>
                        b.CommandTimeout(this.CommandTimeout ?? DefaultMasterConnectionCommandTimeout)).
                Options;

            return new SqlServerConnection(this.Dependencies.With(contextOptions: contextOptions));
        }

        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public override Boolean IsMultipleActiveResultSetsEnabled
            => (Boolean) ( this._multipleActiveResultSetsEnabled
                           ?? ( this._multipleActiveResultSetsEnabled
                               = new SqlConnectionStringBuilder(connectionString: this.ConnectionString).
                                   MultipleActiveResultSets ) );

        /// <summary>
        ///     This API supports the Entity Framework Core infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        protected override DbConnection CreateDbConnection() =>
            new SqlConnection(connectionString: this.ConnectionString);
    }
}
