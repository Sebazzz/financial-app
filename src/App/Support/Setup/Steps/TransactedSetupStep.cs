// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TransactedSetupStep.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup.Steps {
    using System.Data;
    using System.Threading.Tasks;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Storage;

    public abstract class TransactedSetupStep : AbstractSetupStep {
        protected TransactedSetupStep(DbContext dbContext) {
            this.DbContext = dbContext;
        }

        protected DbContext DbContext { get; }

        internal sealed override async Task Execute(object data) {
            using (IDbContextTransaction tran = await this.DbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable)) {
                await this.ExecuteCore(data, tran);

                tran.Commit();
            }
        }

        protected abstract Task ExecuteCore(object data, IDbContextTransaction transaction);
    }
}
