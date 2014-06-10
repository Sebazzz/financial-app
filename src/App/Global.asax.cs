namespace App
{
    using System.Web.Http;

    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
            MvcConfig.Register();
            BundleConfig.Register();
        }


        protected void Application_Error() {
            
        }
    }
}
