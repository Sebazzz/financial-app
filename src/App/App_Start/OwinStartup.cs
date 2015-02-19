using Microsoft.Owin;

[assembly: OwinStartup(typeof(App.OwinStartup))]

namespace App {
    using System;
    using System.Data.Entity;
    using System.Web.Http;
    using Microsoft.Owin.Security.OAuth;
    using Migrations;
    using Models.Domain;
    using Models.Domain.Identity;
    using Owin;

    public sealed class OwinStartup {
        public void Configuration(IAppBuilder app) {
            ContainerConfig.Configure();

            HttpConfiguration config = new HttpConfiguration();
            ContainerConfig.SetUpIntegration(config);

            this.ConfigureAuth(app);
            this.ConfigureOAuth(app);
            WebApiConfig.Register(config);

            AutoMapperConfig.Configure();
            MvcConfig.Register();
            BundleConfig.Register();

            app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);
            app.UseWebApi(config);

            Database.SetInitializer(new MigrateDatabaseToLatestVersion<AppDbContext, Configuration>());
        }

        private void ConfigureOAuth(IAppBuilder app) {
            OAuthAuthorizationServerOptions authServerOptions = new OAuthAuthorizationServerOptions()
            {
                AllowInsecureHttp = true,
                TokenEndpointPath = new PathString("/api/token"),
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(365),
                Provider = new Api.SimpleAuthorizationServerProvider()
            };
 
            // Token Generation
            app.UseOAuthAuthorizationServer(authServerOptions);
            app.UseOAuthBearerAuthentication(new OAuthBearerAuthenticationOptions());
        }

        public void ConfigureAuth(IAppBuilder app) {
            // Configure the db context and user manager to use a single instance per request
            app.CreatePerOwinContext(() => ContainerConfig.Container.GetInstance<AppDbContext>());
            app.CreatePerOwinContext<AppUserManager>(AppUserManager.Create);
        }
    }


}