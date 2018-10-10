// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DatabaseSchemaSetupStep.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup.Steps {
    using System;
    using System.Data.Common;
    using System.Linq;
    using System.Threading.Tasks;

    using Microsoft.EntityFrameworkCore;

    public sealed class DatabaseSchemaSetupStep : AbstractSetupStep {
        private readonly DbContext _dbContext;

        public DatabaseSchemaSetupStep(DbContext dbContext) {
            this._dbContext = dbContext;
        }

        public override string Name => "Database initialiseren";

        internal override async ValueTask<Boolean> HasBeenExecuted() {
            await this._dbContext.Database.OpenConnectionAsync();

            const string sql = @"
                 SELECT COUNT(*) 
                 FROM INFORMATION_SCHEMA.TABLES 
                 WHERE TABLE_NAME = '__EFMigrationsHistory'";

            using (DbCommand cmd = this._dbContext.Database.GetDbConnection().CreateCommand()) {
                cmd.CommandText = sql;

                int count = (int) await cmd.ExecuteScalarAsync();
                if (count == 0) {
                    return false;
                }
            }

            bool hasPendingMigrations = (await this._dbContext.Database.GetPendingMigrationsAsync()).Any();
            return !hasPendingMigrations;
        }

        internal override Task Execute(object data) {
            return this._dbContext.Database.MigrateAsync();
        }
    }
}