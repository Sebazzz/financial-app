namespace App.Controllers {
    using Microsoft.AspNet.Mvc;
    using Support;
    using Support.Filters;

    [DefaultResponseCacheFilter]
    public sealed class HomeController : Controller {
        public IActionResult Index() {
            this.ViewBag.AppVersion = AppVersion.Informational;
            
            return this.View();
        }
    }
}