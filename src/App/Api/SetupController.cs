// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SetupController.cs
//  Project         : App
// ******************************************************************************
namespace App.Api {
    using System.Collections.Generic;
    using System.Threading.Tasks;

    using Microsoft.AspNetCore.Mvc;

    using Support.Filters;
    using Support.Setup;

    [SetupAuthorize]
    [AllowDuringSetup]
    [Route("api/setup")]
    public sealed class SetupController : Controller {
        private readonly SetupService _setupService;
        private readonly AppSetupState _appSetupState;

        public SetupController(SetupService setupService, AppSetupState appSetupState) {
            this._setupService = setupService;
            this._appSetupState = appSetupState;
        }

        [HttpGet("")]
        public async Task<SetupState> GetState() {
            return new SetupState {
                CurrentStep = await this._setupService.DetermineCurrentStep(),
                Steps = this._setupService.GetSteps()
            };
        }

        [HttpPost("")]
        public async Task<IActionResult> Execute([FromBody] SetupStepInvocation invocation) {
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }
            try {
                SetupStepDescriptor setupStep = await this._setupService.ExecuteStep(invocation, this.TryValidateModel);

                if (setupStep.IsDone) this._appSetupState.Mark();

                return this.Ok(setupStep);
            }
            catch (SetupValidationException ex) {
                return this.BadRequest(ex.ModelState ?? this.ModelState);
            }
            catch (SetupStepFailureException ex) {
                return this.StatusCode(500, ex.ToString());
            }
            catch (SetupWizardOutOfSyncException) {
                return this.BadRequest();
            }
        }
    }

    public sealed class SetupState {
        public SetupStepDescriptor CurrentStep { get; set; }

        public IEnumerable<SetupStepDescriptor> Steps { get; set; }
    }
}
