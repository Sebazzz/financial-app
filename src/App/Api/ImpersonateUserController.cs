﻿using System.Collections.Generic;
using System.Linq;
using System.Net;

namespace App.Api
{
    using System.Threading.Tasks;
    using AutoMapper.QueryableExtensions;
    using Extensions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Models.Domain.Identity;
    using Models.DTO;
    using App.Models.Domain.Services;
    using AutoMapper;

    using Microsoft.EntityFrameworkCore;

    [Authorize]
    [Route("api/user/impersonate")]
    public class ImpersonateUserController : Controller {
        private readonly SignInManager<AppUser> _authenticationManager;
        private readonly AppUserManager _appUserManager;
        private readonly IMapper _mappingEngine;

        public ImpersonateUserController(AppUserManager appUserManager, SignInManager<AppUser> authenticationManager, IMapper mappingEngine) {
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
                                       .ProjectTo<AppUserListing>(this._mappingEngine.ConfigurationProvider);
        }

        // POST: api/user/impersonate/3
        [HttpPost]
        [Route("{id}")]
        public async Task<AuthenticationInfo> Impersonate(int id) {
            int currentUserId = this.User.Identity.GetUserId();

            AppUser currentUser = await this._appUserManager.FindByIdAsync(currentUserId).EnsureNotNull(HttpStatusCode.Forbidden);

            AppUser user = await this._appUserManager.Users.Where(x => x.Id == id).Include(x => x.TrustedUsers).FirstOrDefaultAsync().EnsureNotNull(HttpStatusCode.Forbidden);

            if (!user.TrustedUsers.Contains(currentUser)) {
                throw new HttpStatusException(HttpStatusCode.Forbidden);
            }

            await this._authenticationManager.SignInAsync(user, true);

            return new AuthenticationInfo {
                IsAuthenticated = true,
                UserId = user.Id,
                UserName = user.UserName
            };
        } 
    }
}
