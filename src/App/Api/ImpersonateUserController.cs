using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace App.Api
{
    using System.Threading.Tasks;
    using AutoMapper.QueryableExtensions;
    using Extensions;
    using Microsoft.AspNet.Identity;
    using Microsoft.Owin.Security;
    using Models.Domain.Identity;
    using Models.DTO;

    [Authorize]
    [RoutePrefix("api/user/impersonate")]
    public class ImpersonateUserController : ApiController {
        private readonly IAuthenticationManager _authenticationManager;
        private readonly AppUserManager _appUserManager;
        public ImpersonateUserController(AppUserManager appUserManager, IAuthenticationManager authenticationManager) {
            this._appUserManager = appUserManager;
            this._authenticationManager = authenticationManager;
        }

        // GET: api/user/impersonate
        [HttpGet]
        [Route("")]
        public IEnumerable<AppUserListing> Get() {
            int userId = this.User.Identity.GetUserId<int>();
            return this._appUserManager.Users
                                       .Where(x => x.TrustedUsers.Any(u => u.Id == userId))
                                       .OrderBy(x => x.UserName)
                                       .Project()
                                       .To<AppUserListing>();
        }

        // POST: api/user/impersonate/3
        [HttpPost]
        [Route("{id}")]
        public async Task<AuthenticationInfo> Impersonate(int id) {
            int currentUserId = this.User.Identity.GetUserId<int>();

            AppUser currentUser = await this._appUserManager.FindByIdAsync(currentUserId);
            currentUser.EnsureNotNull(HttpStatusCode.Forbidden);

            AppUser user = await this._appUserManager.FindByIdAsync(id);
            user.EnsureNotNull(HttpStatusCode.Forbidden);

            if (!user.TrustedUsers.Contains(currentUser)) {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
            }

            this._authenticationManager.SignIn(
                new AuthenticationProperties { IsPersistent = true}, await user.GenerateUserIdentityAsync(this._appUserManager));

            return new AuthenticationInfo {
                                                IsAuthenticated = true,
                                                UserId = user.Id,
                                                UserName = user.UserName
                                            };
        } 
    }
}
