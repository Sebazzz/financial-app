namespace App
{
    using System.Web.Http;

    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            MvcConfig.Register();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            BundleConfig.Register();
        }


        protected void Application_Error() {
            
        }
    }
}
