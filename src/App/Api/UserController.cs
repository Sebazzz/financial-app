namespace App.Api {
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Globalization;
    using System.Linq;
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using System.Web.Http;
    using AutoMapper.QueryableExtensions;
    using Extensions;
    using Microsoft.AspNet.Identity;
    using Models.Domain;
    using Models.Domain.Identity;
    using Models.Domain.Repositories;
    using Models.DTO;

    [Authorize]
    public class UserController : ApiController {
        private readonly AppUserManager _appUserManager;
        private readonly AppOwnerRepository _appOwnerRepository;

        public UserController(AppUserManager appUserManager, AppOwnerRepository appOwnerRepository) {
            this._appUserManager = appUserManager;
            this._appOwnerRepository = appOwnerRepository;
        }

        protected int OwnerId => this.User.Identity.GetOwnerGroupId();

        // GET: api/User
        public IEnumerable<AppUserListing> Get() {
            return this._appUserManager.Users
                                       .Where(x => x.Group.Id == this.OwnerId)
                                       .OrderBy(x => x.UserName)
                                       .Project().To<AppUserListing>();
        }

        // GET: api/User/5
        public async Task<AppUserListing> Get(int id) {
            AppUser user = await this.GetUser(id);

            return AutoMapper.Mapper.Map<AppUserListing>(user);
        }

        private async Task<AppUser> GetUser(int id) {
            AppUser user = await this._appUserManager.FindByIdAsync(id);
            user.EnsureNotNull();
            this.EnsureAccess(user);

            return user;
        }

        // POST: api/User
        public async Task<InsertId> Post([FromBody] AppUserMutate value) {
            AppUser newUser = AppUser.Create(value.UserName, value.Email, this.GetCurrentGroup());
            IdentityResult result = await this._appUserManager.CreateAsync(newUser, value.NewPassword);
            this.EnsureSucceeded(result);

            return newUser.Id;
        }

        private void EnsureSucceeded(IdentityResult result) {
            if (!result.Succeeded) {
                throw new HttpResponseException(
                    this.Request.CreateResponse(HttpStatusCode.BadRequest, result.Errors));
            }
        }

        // PUT: api/User/5
        public async Task<InsertId> Put(int id, [FromBody] AppUserMutate value) {
            AppUser currentUser = await this.GetUser(id);

            if (value.UserName != null) this.EnsureNotCurrentUser(id);

            currentUser.UserName = value.UserName ?? currentUser.UserName;
            currentUser.Email = value.Email ?? currentUser.Email;
            IdentityResult result = await this._appUserManager.UpdateAsync(currentUser);
            this.EnsureSucceeded(result);

            if (value.NewPassword != null) {
                if (this.User.Identity.GetUserId() == id.ToString(CultureInfo.CurrentCulture)) {
                    if (value.CurrentPassword == null) throw new HttpResponseException(HttpStatusCode.BadRequest);

                    result =
                        await this._appUserManager.ChangePasswordAsync(currentUser.Id, value.CurrentPassword, value.NewPassword);
                }
                else {
                    result = await this._appUserManager.ChangePasswordAsync(currentUser.Id, value.NewPassword);
                }
                this.EnsureSucceeded(result);
            }

            return id;
        }

        // DELETE: api/User/5
        public async Task Delete(int id) {
            this.EnsureNotCurrentUser(id);

            AppUser currentUser = await this.GetUser(id);
            await this._appUserManager.DeleteAsync(currentUser);
        }

        private void EnsureAccess(AppUser user) {
            if (user.Group.Id != this.OwnerId) {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
            }
        }

        private AppOwner GetCurrentGroup() {
            AppOwner group = this._appOwnerRepository.FindById(this.OwnerId);
            Debug.Assert(group != null, "Something went terribly wrong...");
            return group;
        }

        private void EnsureNotCurrentUser(int targetUserId) {
            if (targetUserId.ToString(CultureInfo.InvariantCulture) == this.User.Identity.GetUserId()) {
                throw new HttpResponseException(
                    this.Request.CreateErrorResponse(HttpStatusCode.BadRequest, "You cannot edit your own details."));
            }
        }
    }
}