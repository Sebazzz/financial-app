﻿namespace App.Api {
    using System.Net;
    using System.Threading.Tasks;
    using Extensions;

    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Models.Domain.Identity;
    using Models.DTO;
    using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

    [Route("api/authentication")]
    public class AuthenticationController : Controller {
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
        public async Task<IActionResult> Login([FromBody]LoginModel parameters) {
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            AppUser user = await this._appUserManager.FindByNameAsync(parameters.UserName).EnsureNotNull(HttpStatusCode.Forbidden);

            SignInResult result = await this._authenticationManager.PasswordSignInAsync(user, parameters.Password, true, false);
            if (result.Succeeded == false) {
                return this.Ok(new AuthenticationInfo {
                    IsAuthenticated = false
                });
            }

            return this.Ok(new AuthenticationInfo {
                IsAuthenticated = true,
                UserId = user.Id,
                UserName = user.UserName
            });
        }

        [HttpPost]
        [Route("logoff")]
        public async Task<AuthenticationInfo> LogOff() {
            await this._authenticationManager.SignOutAsync();

            return new AuthenticationInfo();
        }
    }
}
