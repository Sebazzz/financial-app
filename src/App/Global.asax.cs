namespace App {
    using System;
    using System.Data.Entity;
    using System.Diagnostics;
    using System.IO;
    using System.Web;
    using System.Web.Http;
    using Migrations;
    using Models.Domain;

    public class WebApiApplication : HttpApplication {
        protected void Application_Start() {
            ContainerConfig.Configure();
            AutoMapperConfig.Configure();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            MvcConfig.Register();
            BundleConfig.Register();

            Database.SetInitializer(new MigrateDatabaseToLatestVersion<AppDbContext, Configuration>());
        }
    }
}