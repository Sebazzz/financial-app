// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DatabaseInitialSeedStep.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup.Steps {
    using System.Linq;
    using System.Threading.Tasks;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Storage;

    using Models.Domain.Identity;

    public sealed class DatabaseInitialSeedStep : TransactedSetupStep {
        private readonly AppRoleManager _roleManager;

        public DatabaseInitialSeedStep(AppRoleManager roleManager, DbContext dbContext) : base(dbContext) {
            this._roleManager = roleManager;
        }

        public override string Name => "Stamdata invoeren";

        internal override async ValueTask<bool> HasBeenExecuted() {
            if ((await this.DbContext.Database.GetPendingMigrationsAsync()).Any()) {
                return false;
            }

            return await this.DbContext.Set<AppRole>().AnyAsync();
        }

        protected override async Task ExecuteCore(object data, IDbContextTransaction transaction) {
            if (!await this._roleManager.RoleExistsAsync(AppRole.KnownRoles.Administrator)) {
                await this._roleManager.CreateAsync(new AppRole {
                    Name = AppRole.KnownRoles.Administrator
                });
            }

            await this.DbContext.SaveChangesAsync();
        }
    }
}