namespace App.Controllers {
    using System.Diagnostics;
    using System.Reflection;
    using System.Web;
    using System.Web.Mvc;

    public sealed class HomeController : Controller {
        private static readonly string AppVersion = InitVersion();
        private static string InitVersion() {
            var versionAttr =
                typeof (HomeController).Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>();
            Debug.Assert(versionAttr != null, "This should not be null. Was the assembly properly built?");
            return versionAttr.InformationalVersion;
        }

        // GET: Home
        public ActionResult Index() {
            this.ViewBag.AppVersion = AppVersion;

            this.Response.Cache.SetAllowResponseInBrowserHistory(true);
            this.Response.Cache.SetRevalidation(HttpCacheRevalidation.AllCaches);

            return this.View();
        }
    }
}