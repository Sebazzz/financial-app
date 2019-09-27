// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SetupStepFactory.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup.Steps {
    using System;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;

    using Models.Domain.Identity;

    public sealed class SetupStepFactory {
        private readonly IServiceProvider _requestServiceProvider;

        public SetupStepFactory(IServiceProvider requestServiceProvider) {
            this._requestServiceProvider = requestServiceProvider;
        }

        public AbstractSetupStep[] GetSteps() {
            var dbContext = this._requestServiceProvider.GetRequiredService<DbContext>();
            var roleManager = this._requestServiceProvider.GetRequiredService<AppRoleManager>();
            var userManager = this._requestServiceProvider.GetRequiredService<AppUserManager>();

            return new AbstractSetupStep[] {
                new WelcomeSetupStep(),
                new DatabaseConnectionSetupStep(dbContext),
                new DatabaseSchemaSetupStep(dbContext),
                new DatabaseInitialSeedStep(roleManager, dbContext),
                new AdminUserSetupStep(dbContext, userManager),
                new DoneSetupStep()
            };
        }
    }
}
