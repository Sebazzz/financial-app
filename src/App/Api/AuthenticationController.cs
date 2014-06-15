namespace App.Api {
    using System;
    using System.Net;
    using System.Threading.Tasks;
    using System.Web;
    using System.Web.Http;
    using Extensions;
    using Microsoft.AspNet.Identity;
    using Microsoft.Owin.Security;
    using Models.Domain.Identity;
    using Models.DTO;

    [RoutePrefix("api/authentication")]
    public class AuthenticationController : ApiController {
        private readonly IAuthenticationManager _authenticationManager;
        private readonly AppUserManager _appUserManager;
        public AuthenticationController(AppUserManager appUserManager, IAuthenticationManager authenticationManager) {
            this._appUserManager = appUserManager;
            this._authenticationManager = authenticationManager;
        }

        [HttpGet]
        [Route("check")]
        public AuthenticationInfo CheckAuthentication() {
            return new AuthenticationInfo() {
                                                UserId = Int32.Parse(this.User.Identity.GetUserId() ?? "0"),
                                                UserName = this.User.Identity.GetUserName(),
                                                IsAuthenticated = this.User.Identity.IsAuthenticated
                                            };
        }

        [HttpPost]
        [Route("login")]
        public async Task<AuthenticationInfo> Login([FromBody]LoginModel parameters) {
            AppUser user = await this._appUserManager.FindAsync(parameters.UserName, parameters.Password);
            user.EnsureNotNull(HttpStatusCode.Forbidden);

            this._authenticationManager.SignIn(
                new AuthenticationProperties() {
                                                   IsPersistent = parameters.Persistent
                                               }, await user.GenerateUserIdentityAsync(this._appUserManager));

            return new AuthenticationInfo {
                                                IsAuthenticated = true,
                                                UserId = user.Id,
                                                UserName = user.UserName
                                            };
        } 
    }
}