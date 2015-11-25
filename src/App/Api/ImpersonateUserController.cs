using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;

namespace App.Api
{
    using System.Threading.Tasks;
    using AutoMapper.QueryableExtensions;
    using Extensions;
    using Microsoft.AspNet.Authorization;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Mvc;
    using Models.Domain.Identity;
    using Models.DTO;
    using App.Models.Domain.Services;
    using AutoMapper;

    [Authorize]
    [Route("api/user/impersonate")]
    public class ImpersonateUserController : ApiController {
        private readonly SignInManager<AppUser> _authenticationManager;
        private readonly AppUserManager _appUserManager;
        private readonly IMappingEngine _mappingEngine;

        public ImpersonateUserController(AppUserManager appUserManager, SignInManager<AppUser> authenticationManager, IMappingEngine mappingEngine) {
            this._appUserManager = appUserManager;
            this._authenticationManager = authenticationManager;
            this._mappingEngine = mappingEngine;
        }

        // GET: api/user/impersonate
        [HttpGet]
        [Route("")]
        public IEnumerable<AppUserListing> Get() {
            int userId = this.User.Identity.GetUserId();
            return this._appUserManager.Users
                                       .Where(x => x.TrustedUsers.Any(u => u.TargetUser.Id == userId))
                                       .OrderBy(x => x.UserName)
                                       .ProjectTo<AppUserListing>(null, this._mappingEngine);
        }

                // POST: api/user/impersonate/3
        [HttpPost]
        [Route("{id}")]
        public async Task<AuthenticationInfo> Impersonate(int id) {
            int currentUserId = this.User.Identity.GetUserId();

            AppUser currentUser = await this._appUserManager.FindByIdAsync(currentUserId);
            currentUser.EnsureNotNull(HttpStatusCode.Forbidden);

            AppUser user = await this._appUserManager.FindByIdAsync(id);
            user.EnsureNotNull(HttpStatusCode.Forbidden);

            if (!user.TrustedUsers.Contains(currentUser)) {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
            }

            await this._authenticationManager.SignInAsync(currentUser, true);

            return new AuthenticationInfo {
                                                IsAuthenticated = true,
                                                UserId = user.Id,
                                                UserName = user.UserName
                                            };
        } 
    }
}
