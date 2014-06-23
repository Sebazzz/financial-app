namespace App.Controllers
{
    using System.Web;
    using System.Web.Mvc;

    public sealed class HomeController : Controller
    {
        // GET: Home
        public ActionResult Index()
        {
            this.Response.Cache.SetAllowResponseInBrowserHistory(true);
            this.Response.Cache.SetRevalidation(HttpCacheRevalidation.AllCaches);

            return this.View();
        }
    }
}