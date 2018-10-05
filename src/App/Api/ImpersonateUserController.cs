// ******************************************************************************
//  © 2015 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : ImpersonateUserController.cs
//  Project         : App
// ******************************************************************************

namespace App.Api {
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using AutoMapper.QueryableExtensions;
    using Extensions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Models.Domain.Identity;
    using Models.Domain.Services;
    using Models.DTO;
    using Support.Filters;

    [Authorize]
    [Route("api/user/impersonate")]
    public class ImpersonateUserController : Controller {
        private readonly AppUserManager _appUserManager;
        private readonly SignInManager<AppUser> _authenticationManager;
        private readonly IMapper _mappingEngine;

        public ImpersonateUserController(AppUserManager appUserManager, SignInManager<AppUser> authenticationManager,
            IMapper mappingEngine) {
            this._appUserManager = appUserManager;
            this._authenticationManager = authenticationManager;
            this._mappingEngine = mappingEngine;
        }

        // GET: api/user/impersonate
        [HttpGet]
        [Route("")]
        [ReadOnlyApi]
        public IEnumerable<AppUserListing> Get() {
            var userId = this.User.Identity.GetUserId();
            return this._appUserManager.Users
                .Where(x => x.TrustedUsers.Any(u => u.TargetUser.Id == userId))
                .OrderBy(x => x.UserName)
                .ProjectTo<AppUserListing>(this._mappingEngine.ConfigurationProvider);
        }

        // POST: api/user/impersonate/3
        [HttpPost]
        [Route("{id}")]
        public async Task<AuthenticationInfo> Impersonate(int id) {
            var currentUserId = this.User.Identity.GetUserId();

            var currentUser = await this._appUserManager.FindByIdAsync(currentUserId)
                .EnsureNotNull(HttpStatusCode.Forbidden);

            var user = await this._appUserManager.Users.Where(x => x.Id == id).Include(x => x.TrustedUsers)
                .FirstOrDefaultAsync().EnsureNotNull(HttpStatusCode.Forbidden);

            if (!user.TrustedUsers.Contains(currentUser)) throw new HttpStatusException(HttpStatusCode.Forbidden);

            await this._authenticationManager.SignInAsync(user, true);

            return new AuthenticationInfo {
                IsAuthenticated = true,
                UserId = user.Id,
                UserName = user.UserName
            };
        }
    }
}