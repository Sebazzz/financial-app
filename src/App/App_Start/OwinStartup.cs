using Microsoft.Owin;

[assembly: OwinStartup(typeof(App.OwinStartup))]

namespace App {
    using System;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.Owin;
    using Microsoft.Owin.Security.Cookies;
    using Models.Domain;
    using Models.Domain.Identity;
    using Owin;
    using SimpleInjector;

    public sealed class OwinStartup {
        public void Configuration(IAppBuilder app) {
            ConfigureAuth(app);
        }

        public void ConfigureAuth(IAppBuilder app) {
            // Configure the db context and user manager to use a single instance per request
            app.CreatePerOwinContext(() => ContainerConfig.Container.GetInstance<AppDbContext>());
            app.CreatePerOwinContext<AppUserManager>(AppUserManager.Create);

            // Enable the application to use a cookie to store information for the signed in user
            app.UseCookieAuthentication(new CookieAuthenticationOptions {
                AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/Account/Login"),
                ExpireTimeSpan = TimeSpan.FromDays(30),
                SlidingExpiration = true,
                Provider = new CookieAuthenticationProvider {
                    OnValidateIdentity = SecurityStampValidator.OnValidateIdentity<AppUserManager, AppUser, int>(
                        validateInterval: TimeSpan.FromMinutes(20),
                        regenerateIdentityCallback: (manager, user) => user.GenerateUserIdentityAsync(manager),
                        getUserIdCallback: id => Int32.Parse(id.GetUserId() ?? "0"))
                }
            });
        }
    }
}