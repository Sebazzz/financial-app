namespace App.Controllers
{
    using System.Web.Mvc;

    public sealed class HomeController : Controller
    {
        // GET: Home
        public ActionResult Index()
        {
            return this.View();
        }
    }
}