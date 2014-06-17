namespace App
{
    using System.Data.Entity;
    using System.Web.Http;
    using Migrations;
    using Models.Domain;

    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AutoMapperConfig.Configure();
            ContainerConfig.Configure();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            MvcConfig.Register();
            BundleConfig.Register();

            Database.SetInitializer(new MigrateDatabaseToLatestVersion<AppDbContext,Configuration>());
        }
    }
}
