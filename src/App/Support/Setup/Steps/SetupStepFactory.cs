// ******************************************************************************
//  © 2017 Ernst & Young - www.ey.com | www.beco.nl
// 
//  Author          : Ernst & Young - Cleantech and Sustainability
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
            DbContext dbContext = this._requestServiceProvider.GetRequiredService<DbContext>();
            AppRoleManager roleManager = this._requestServiceProvider.GetRequiredService<AppRoleManager>();
            AppUserManager userManager = this._requestServiceProvider.GetRequiredService<AppUserManager>();

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
