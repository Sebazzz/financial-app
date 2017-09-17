namespace App.Api {
    using System.Net;
    using System.Threading.Tasks;
    using System.Web.Http;
    using Extensions;

    using Microsoft.AspNetCore.Authentication;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Models.Domain.Identity;
    using Models.DTO;
    using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

    [Route("api/authentication")]
    public class AuthenticationController : ApiController {
        private readonly SignInManager<AppUser> _authenticationManager;
        private readonly AppUserManager _appUserManager;
        public AuthenticationController(AppUserManager appUserManager, SignInManager<AppUser> authenticationManager) {
            this._appUserManager = appUserManager;
            this._authenticationManager = authenticationManager;
        }

        [HttpGet]
        [Route("check")]
        public AuthenticationInfo CheckAuthentication() {
            return new AuthenticationInfo() {
                UserId = this.User.Identity.GetUserId(),
                UserName = this.User.Identity.Name,
                IsAuthenticated = this.User.Identity.IsAuthenticated
            };
        }

        [HttpPost]
        [Route("login")]
        public async Task<AuthenticationInfo> Login([FromBody]LoginModel parameters) {
            AppUser user = await this._appUserManager.FindByNameAsync(parameters.UserName);
            user.EnsureNotNull(HttpStatusCode.Forbidden);

            SignInResult result = await this._authenticationManager.PasswordSignInAsync(user, parameters.Password, true, false);
            if (result.Succeeded == false) {
                return new AuthenticationInfo {
                    IsAuthenticated = false
                };
            }

            return new AuthenticationInfo {
                IsAuthenticated = true,
                UserId = user.Id,
                UserName = user.UserName
            };
        }

        [HttpPost]
        [Route("logoff")]
        public async Task<AuthenticationInfo> LogOff() {
            await this._authenticationManager.SignOutAsync();

            return new AuthenticationInfo();
        }
    }
}
