namespace App
{
    using System.Web.Http;

    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AutoMapperConfig.Configure();
            ContainerConfig.Configure();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            MvcConfig.Register();
            BundleConfig.Register();
        }
    }
}
