// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DatabaseConnectionSetupStep.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup.Steps {
    using System;
    using System.Threading.Tasks;

    using Microsoft.EntityFrameworkCore;

    public sealed class DatabaseConnectionSetupStep : AbstractSetupStep {
        private readonly DbContext _dbContext;
        private static bool _IsDone;

        public DatabaseConnectionSetupStep(DbContext dbContext) {
            this._dbContext = dbContext;
        }

        public override string Name => "Databaseverbinding";

        internal override ValueTask<Boolean> HasBeenExecuted() {
            return new ValueTask<bool>(_IsDone);
        }

        internal override async Task Execute(object data) {
            await this._dbContext.Database.OpenConnectionAsync();
            _IsDone = true;
        }
    }
}