namespace App.Controllers {
    using System.Web;
    using System.Web.Mvc;
    using Support;

    public sealed class HomeController : Controller {
        // GET: Home
        public ActionResult Index() {
            this.ViewBag.AppVersion = AppVersion.Informational;

            this.Response.Cache.SetAllowResponseInBrowserHistory(true);
            this.Response.Cache.SetRevalidation(HttpCacheRevalidation.AllCaches);

            return this.View();
        }
    }
}