using Microsoft.Owin;

[assembly: OwinStartup(typeof(App.OwinStartup))]

namespace App {
    using System;
    using System.Data.Entity;
    using System.Diagnostics;
    using System.Runtime.InteropServices;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using System.Web.Http;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.Owin;
    using Microsoft.Owin.Security;
    using Microsoft.Owin.Security.Cookies;
    using Microsoft.Owin.Security.Infrastructure;
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
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(365),
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

                await ValidateIdentity(context, user, repo);
            }
        }

        private static async Task ValidateIdentity(OAuthGrantResourceOwnerCredentialsContext context, AppUser user, AppUserManager repo) {
            ClaimsIdentity identity = await user.GenerateUserIdentityAsync(repo, context.Options.AuthenticationType);
            context.Validated(identity);
        }

        /// <summary>
        /// Called when a request to the Token endpoint arrives with a "grant_type" of any other value. If the application supports custom grant types
        ///             it is entirely responsible for determining if the request should result in an access_token. If context.Validated is called with ticket
        ///             information the response body is produced in the same way as the other standard grant types. If additional response parameters must be
        ///             included they may be added in the final TokenEndpoint call.
        ///             See also http://tools.ietf.org/html/rfc6749#section-4.5
        /// </summary>
        /// <param name="context">The context of the event carries information in and results out.</param>
        /// <returns>
        /// Task to enable asynchronous execution
        /// </returns>
        public override Task GrantCustomExtension(OAuthGrantCustomExtensionContext context) {
            if (context.GrantType == "impersonate") {
                return GrantImpersonation(context);
            }

            return Task.FromResult<Object>(null);
        }

        private static async Task GrantImpersonation(OAuthGrantCustomExtensionContext context) {
            string ticketString = context.Parameters["ticket"];
            AuthenticationTicket ticket = context.Options.AccessTokenFormat.Unprotect(ticketString);

            if (ticket == null) {
                context.SetError("invalid_grant", "The access token is invalid.");
                return;
            }

            using (var repo = ContainerConfig.Container.GetInstance<AppUserManager>()) {
                string userIdString = ticket.Identity.GetUserId();
                var currentUser = await repo.FindByIdAsync(Int32.Parse(userIdString));

                if (currentUser == null) {
                    context.SetError("invalid_grant", "The access token is invalid.");
                    return;
                }

                string targetUserIdString = context.Parameters["userid"];
                int targetUserId;
                Int32.TryParse(targetUserIdString, out targetUserId);

                var targetUser = await repo.FindByIdAsync(targetUserId);

                if (targetUser == null || !targetUser.TrustedUsers.Contains(currentUser)) {
                    context.SetError("invalid_parameter", "The impersonation user id is invalid.");
                    return;
                }

                await ValidateIdentity(context, targetUser, repo);
            }
        }

        private static async Task ValidateIdentity(OAuthGrantCustomExtensionContext context, AppUser user, AppUserManager repo) {
            ClaimsIdentity identity = await user.GenerateUserIdentityAsync(repo, context.Options.AuthenticationType);
            context.Validated(identity);
        }
    }


}