using Microsoft.Owin;

[assembly: OwinStartup(typeof(App.OwinStartup))]

namespace App {
    using System;
    using System.Data.Entity;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using System.Web.Http;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.Owin;
    using Microsoft.Owin.Security.Cookies;
    using Microsoft.Owin.Security.OAuth;
    using Migrations;
    using Models.Domain;
    using Models.Domain.Identity;
    using Owin;
    using SimpleInjector;

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
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(1),
                Provider = new SimpleAuthorizationServerProvider()
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

    public class SimpleAuthorizationServerProvider : OAuthAuthorizationServerProvider {
        public override async Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context) {
            context.Validated();
        }

        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context) {

            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] {"*"});

            using (var repo = ContainerConfig.Container.GetInstance<AppUserManager>()) {
                var user = await repo.FindAsync(context.UserName, context.Password);

                if (user == null) {
                    context.SetError("invalid_grant", "The user name or password is incorrect.");
                    return;
                }

                ClaimsIdentity identity = await user.GenerateUserIdentityAsync(repo, context.Options.AuthenticationType);
                context.Validated(identity);
            }
        }
    }


}