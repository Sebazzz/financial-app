namespace App.Api {
    using System;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Microsoft.AspNet.Identity;
    using Microsoft.Owin.Security;
    using Microsoft.Owin.Security.OAuth;
    using Models.Domain.Identity;

    public class SimpleAuthorizationServerProvider : OAuthAuthorizationServerProvider {
        private static readonly Task Nop = Task.FromResult<Object>(null);

        public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context) {
            context.Validated();
            return Nop;
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

            return Nop;
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

                AppUser targetUser = await GetTargetUser(context, repo);

                if (targetUser == null || !targetUser.TrustedUsers.Contains(currentUser)) {
                    context.SetError("invalid_parameter", "The impersonation user id is invalid.");
                    return;
                }

                await ValidateIdentity(context, targetUser, repo);
            }
        }

        private static async Task<AppUser> GetTargetUser(OAuthGrantCustomExtensionContext context, AppUserManager repo) {
            string targetUserIdString = context.Parameters["userid"];
            int targetUserId;
            Int32.TryParse(targetUserIdString, out targetUserId);

            var targetUser = await repo.FindByIdAsync(targetUserId);
            return targetUser;
        }

        private static async Task ValidateIdentity(OAuthGrantCustomExtensionContext context, AppUser user, AppUserManager repo) {
            ClaimsIdentity identity = await user.GenerateUserIdentityAsync(repo, context.Options.AuthenticationType);
            context.Validated(identity);
        }
    }

}