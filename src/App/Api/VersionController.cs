// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : VersionController.cs
//  Project         : App
// ******************************************************************************
namespace App.Api {
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using App.Support;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    using Support.Filters;
    using Support.Setup;

    [AllowAnonymous]
    [AllowDuringSetup]
    [Route("api/version")]
    public sealed class VersionSetupController : Controller {
        private readonly IAppVersionService _appVersionService;
        public VersionSetupController(IAppVersionService appVersionService) {
            this._appVersionService = appVersionService;
        }

        [HttpGet("")]
        public IActionResult Get() {
            return this.Ok(new {
                AppVersionId = this._appVersionService.GetVersionIdentifier(),
                AppVersion = this._appVersionService.GetVersion()
            });
        }
    }
}
