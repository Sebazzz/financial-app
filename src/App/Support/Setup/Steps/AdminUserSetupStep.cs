// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AdminUserSetupStep.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup.Steps
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.Diagnostics.CodeAnalysis;
    using System.Threading.Tasks;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc.ModelBinding;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Storage;

    using Models.Domain;
    using Models.Domain.Identity;

    public sealed class AdminUserSetupStep : TransactedSetupStep
    {
        private readonly AppUserManager _userManager;

        public AdminUserSetupStep(DbContext dbContext, AppUserManager userManager) : base(dbContext)
        {
            this._userManager = userManager;
        }

        internal override async ValueTask<bool> HasBeenExecuted()
        {
            return (await this._userManager.GetUsersInRoleAsync(AppRole.KnownRoles.Administrator)).Count > 0;
        }

        internal override Type DataType => typeof(SetupUserModel);

        public override string Name => "Administrator maken";

        protected override Task ExecuteCore(object data, IDbContextTransaction transaction)
        {
            return this.ExecuteCore((SetupUserModel)data);
        }

        private async Task ExecuteCore(SetupUserModel data)
        {
            AppUser user = AppUser.Create(data.UserName, data.Email, new AppOwner("Administrator"));

            IdentityResult result = await this._userManager.CreateAsync(user, data.Password);
            EnsureSuccess(result);

            result = await this._userManager.AddToRoleAsync(user, AppRole.KnownRoles.Administrator);
            EnsureSuccess(result);
        }

        [SuppressMessage("ReSharper", "PatternAlwaysOfType")]
        private static void EnsureSuccess(IdentityResult result)
        {
            if (!result.Succeeded)
            {
                var modelState = new ModelStateDictionary();
                foreach (IdentityError identityError in result.Errors)
                {
                    switch (identityError)
                    {
                        case IdentityError _ when identityError.Code.Contains("UserName"):
                            modelState.AddModelError(nameof(SetupUserModel.UserName), identityError.Description);
                            break;

                        case IdentityError _ when identityError.Code.Contains("Email"):
                            modelState.AddModelError(nameof(SetupUserModel.Email), identityError.Description);
                            break;

                        default:
                            modelState.AddModelError(nameof(SetupUserModel.Password), identityError.Description);
                            break;
                    }
                }

                throw new SetupValidationException(modelState);
            }
        }

        public sealed class SetupUserModel
        {
            [Required(ErrorMessage = "Geef een gebruikersnaam op")]
            [StringLength(40, MinimumLength = 3)]
            public string UserName { get; set; }

            [Required(ErrorMessage = "Geef een e-mailadres op")]
            [RegularExpression("(.*)@(.*).(.*)", ErrorMessage = "Dit is geen geldig e-mailadres")]
            public string Email { get; set; }

            [Required(ErrorMessage = "Voer een wachtwoord in")]
            public string Password { get; set; }
        }
    }
}