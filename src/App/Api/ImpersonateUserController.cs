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
    using Microsoft.AspNet.Authorization;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Mvc;
    using Models.Domain.Identity;
    using Models.DTO;

    [Authorize]
    [Route("api/user/impersonate")]
    public class ImpersonateUserController : ApiController {
        private readonly AppUserManager _appUserManager;
        public ImpersonateUserController(AppUserManager appUserManager) {
            this._appUserManager = appUserManager;
        }

        // GET: api/user/impersonate
        [HttpGet]
        [Route("")]
        public IEnumerable<AppUserListing> Get() {
            int userId = this.User.Identity.GetUserId();
            return this._appUserManager.Users
                                       .Where(x => x.TrustedUsers.Any(u => u.TargetUser.Id == userId))
                                       .OrderBy(x => x.UserName)
                                       .ProjectTo<AppUserListing>();
        }
    }
}
