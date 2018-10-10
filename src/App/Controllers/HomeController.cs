// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : HomeController.cs
//  Project         : App
// ******************************************************************************
namespace App.Controllers {
    using Microsoft.AspNetCore.Mvc;
    using Support;
    using Support.Filters;

    [DefaultResponseCacheFilter]
    [AllowDuringSetup]
    public sealed class HomeController : Controller {
        private readonly IAppVersionService _appVersionService;
        public HomeController(IAppVersionService appVersionService) {
            this._appVersionService = appVersionService;
        }

        public IActionResult Index() {
            this.ViewBag.AppVersion = this._appVersionService.GetVersionIdentifier();
            
            return this.View();
        }
    }
}