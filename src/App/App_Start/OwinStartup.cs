using App;
using Microsoft.Owin;

[assembly: OwinStartup(typeof (OwinStartup))]

namespace App {
    using System;
    using System.Data.Entity;
    using System.Web.Http;
    using Api;
    using Microsoft.Owin.Cors;
    using Microsoft.Owin.Security.OAuth;
    using Migrations;
    using Models.Domain;
    using Models.Domain.Identity;
    using Owin;

    public sealed class OwinStartup {
        public void Configuration(IAppBuilder app) {
            ContainerConfig.Configure();

            var config = new HttpConfiguration();
            ContainerConfig.SetUpIntegration(config);

            this.ConfigureAuth(app);
            this.ConfigureOAuth(app);
            WebApiConfig.Register(config);

            AutoMapperConfig.Configure();
            MvcConfig.Register();
            BundleConfig.Register();

            app.UseCors(CorsOptions.AllowAll);
            app.UseWebApi(config);

            Database.SetInitializer(new MigrateDatabaseToLatestVersion<AppDbContext, Configuration>());
        }

        private void ConfigureOAuth(IAppBuilder app) {
            var authServerOptions = new OAuthAuthorizationServerOptions {
                                                                            AllowInsecureHttp = true,
                                                                            TokenEndpointPath =
                                                                                new PathString("/api/token"),
                                                                            AccessTokenExpireTimeSpan =
                                                                                TimeSpan.FromDays(365),
                                                                            Provider =
                                                                                new SimpleAuthorizationServerProvider()
                                                                        };

            // Token Generation
            app.UseOAuthAuthorizationServer(authServerOptions);
            app.UseOAuthBearerAuthentication(new OAuthBearerAuthenticationOptions());
        }

        public void ConfigureAuth(IAppBuilder app) {
            // Configure the db context and user manager to use a single instance per request
            app.CreatePerOwinContext(() => ContainerConfig.Container.GetInstance<AppDbContext>());
            app.CreatePerOwinContext<AppUserManager>(AppUserManager.Create);

            /*// Enable the application to use a cookie to store information for the signed in user
            app.UseCookieAuthentication(new CookieAuthenticationOptions {
                AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/Account/Login"),
                ExpireTimeSpan = TimeSpan.FromDays(30),
                SlidingExpiration = true,
                Provider = new CookieAuthenticationProvider {
                    OnValidateIdentity = SecurityStampValidator.OnValidateIdentity<AppUserManager, AppUser, int>(
                        validateInterval: TimeSpan.FromMinutes(20),
                        regenerateIdentityCallback: (manager, user) => user.GenerateUserIdentityAsync(manager, DefaultAuthenticationTypes.ApplicationCookie),
                        getUserIdCallback: id => Int32.Parse(id.GetUserId() ?? "0"))
                }
            });*/
        }
    }
}