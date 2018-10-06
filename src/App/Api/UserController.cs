namespace App.Api {
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using App.Support;
    using AutoMapper;
    using AutoMapper.QueryableExtensions;
    using Extensions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.ModelBinding;
    using Models.Domain;
    using Models.Domain.Identity;
    using Models.Domain.Repositories;
    using Models.DTO;

    [Authorize]
    [Route("api/user")]
    public class UserController : Controller {
        private readonly AppUserManager _appUserManager;
        private readonly AppOwnerRepository _appOwnerRepository;
        private readonly IMapper _mappingEngine;

        public UserController(AppUserManager appUserManager, AppOwnerRepository appOwnerRepository, IMapper mappingEngine) {
            this._appUserManager = appUserManager;
            this._appOwnerRepository = appOwnerRepository;
            this._mappingEngine = mappingEngine;
        }

        protected int OwnerId => this.User.Identity.GetOwnerGroupId();

        // GET: api/User
        [HttpGet("")]
        public IEnumerable<AppUserListing> Get() {
            return this._appUserManager.Users
                                       .Where(u => u.AvailableGroups.Any(g => g.GroupId == this.OwnerId))
                                       .OrderBy(x => x.UserName)
                                       .ProjectTo<AppUserListing>(this._mappingEngine.ConfigurationProvider);
        }

        // GET: api/User/5
        [HttpGet("{id}", Name = "User-Get")]
        public async Task<AppUserListing> Get(int id) {
            AppUser user = await this.GetUser(id);

            return this._mappingEngine.Map<AppUserListing>(user);
        }

        private async Task<AppUser> GetUser(int id) {
            AppUser user = await this._appUserManager.FindByIdAsync(id);
            user.EnsureNotNull();
            this.EnsureAccess(user);

            return user;
        }

        // POST: api/User
        [HttpPost("")]
        public async Task<IActionResult> Post([FromBody] AppUserMutate value) {
            AppUser newUser = AppUser.Create(value.UserName, value.Email, this.GetCurrentGroup());
            await this.ValidatePasswordInformation(value, newUser);

            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            IdentityResult result = await this._appUserManager.CreateAsync(newUser, value.NewPassword);
            if (!result.Succeeded) {
                return this.BadRequest(result.Errors);
            }

            return this.CreatedAtRoute("User-Get", new {id = newUser.Id}, this.Get(newUser.Id));
        }

        private async Task ValidatePasswordInformation(AppUserMutate value, AppUser newUser) {
            if (value.CurrentPassword != value.NewPassword) {
                this.ModelState.AddModelError<AppUserMutate>(x => x.NewPassword, "De wachtwoorden zijn niet gelijk aan elkaar.");
            } else if (String.IsNullOrEmpty(value.CurrentPassword)) {
                this.ModelState.AddModelError<AppUserMutate>(x => x.CurrentPassword, "Voer een wachtwoord in.");
            } else {
                foreach (IPasswordValidator<AppUser> passwordValidator in this._appUserManager.PasswordValidators) {
                    var validationResult = await passwordValidator.ValidateAsync(this._appUserManager, newUser, value.CurrentPassword);

                    if (!validationResult.Succeeded) {
                        foreach (IdentityError identityError in validationResult.Errors) {
                            this.ModelState.AddModelError<AppUserMutate>(x => x.CurrentPassword, identityError.Description);
                        }
                    }
                }
            }
        }

        // PUT: api/User/5
        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] AppUserMutate value) {
            AppUser currentUser = await this.GetUser(id);

            if (value.UserName != currentUser.UserName) this.EnsureNotCurrentUser(id);
            if (value.CurrentPassword != null) {
                await this.ValidatePasswordInformation(value, currentUser);
            }

            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            currentUser.UserName = value.UserName ?? currentUser.UserName;
            currentUser.Email = value.Email ?? currentUser.Email;
            IdentityResult result = await this._appUserManager.UpdateAsync(currentUser);
            if (!result.Succeeded) {
                this.ModelState.AppendIdentityResult(result, _ => nameof(value.NewPassword));
                return this.BadRequest(this.ModelState);
            }

            if (value.NewPassword != null) {
                if (this.User.Identity.GetUserId() == id) {
                    if (value.CurrentPassword == null) throw new HttpStatusException(HttpStatusCode.BadRequest);

                    result = await this._appUserManager.ChangePasswordAsync(currentUser, value.CurrentPassword, value.NewPassword);
                }
                else {
                    throw new HttpStatusException(HttpStatusCode.NotImplemented);
                    //result = await this._appUserManager.ChangePasswordAsync(currentUser, value.NewPassword);
                }

                if (!result.Succeeded) {
                    this.ModelState.AppendIdentityResult(result, _ => nameof(value.NewPassword));
                    return this.BadRequest(this.ModelState);
                }
            }

            return this.NoContent();
        }

        // DELETE: api/User/5
        [HttpDelete("{id}")]
        public async Task Delete(int id) {
            this.EnsureNotCurrentUser(id);

            AppUser currentUser = await this.GetUser(id);
            await this._appUserManager.DeleteAsync(currentUser);
        }

        private void EnsureAccess(AppUser user) {
            if (user.AvailableGroups.All(g => g.GroupId != this.OwnerId)) {
                throw new HttpStatusException(HttpStatusCode.Forbidden);
            }
        }

        private AppOwner GetCurrentGroup() {
            AppOwner group = this._appOwnerRepository.FindById(this.OwnerId);
            Debug.Assert(group != null, "Something went terribly wrong...");
            return group;
        }

        private void EnsureNotCurrentUser(int targetUserId) {
            if (targetUserId == this.User.Identity.GetUserId()) {
                throw new InvalidOperationException("You cannot edit your own details.");
            }
        }
    }
}