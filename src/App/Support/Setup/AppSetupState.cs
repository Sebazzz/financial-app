// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppSetupState.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup {
    using System.Threading.Tasks;

    public sealed class AppSetupState {
        private bool? _hasBeenSetup;

        public async ValueTask<bool> HasBeenSetup(SetupService setupService) {
            if (this._hasBeenSetup != null) {
                return this._hasBeenSetup.Value;
            }

            bool hasBeenSetup = await HasBeenSetupCore(setupService);
            this._hasBeenSetup = hasBeenSetup;

            if (hasBeenSetup) {
                return true;
            }

            return false;
        }

        private static async ValueTask<bool> HasBeenSetupCore(SetupService setupService) {
            return (await setupService.DetermineCurrentStep()).IsDone;
        }

        public void Mark() {
            this._hasBeenSetup = true;
        }
    }

    public sealed class RequestAppSetupState {
        private readonly AppSetupState _appSetupState;
        private readonly SetupService _setupService;

        public RequestAppSetupState(AppSetupState appSetupState, SetupService setupService) {
            this._appSetupState = appSetupState;
            this._setupService = setupService;
        }

        public async ValueTask<bool> HasBeenSetup() {
            return await this._appSetupState.HasBeenSetup(this._setupService);
        }
    }
}
