// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : ImpersonateUserController.cs
//  Project         : App
// ******************************************************************************
namespace App.Api {
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper.QueryableExtensions;
    using Extensions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Models.Domain;
    using Models.Domain.Identity;
    using Models.Domain.Services;
    using Models.DTO;
    using Models.DTO.Services;
    using Support.Filters;

    [Authorize]
    [Route("api/user/impersonate")]
    public class ImpersonateUserController : Controller {
        private readonly AppUserManager _appUserManager;
        private readonly AppImpersonationTokenService _appImpersonationTokenService;
        private readonly AppOwnerTokenChangeService _appOwnerTokenChangeService;
        private readonly AuthenticationInfoFactory _authenticationInfoFactory;

        public ImpersonateUserController(AppUserManager appUserManager, AppImpersonationTokenService appImpersonationTokenService, AppOwnerTokenChangeService appOwnerTokenChangeService, AuthenticationInfoFactory authenticationInfoFactory) {
            this._appUserManager = appUserManager;
            this._appImpersonationTokenService = appImpersonationTokenService;
            this._appOwnerTokenChangeService = appOwnerTokenChangeService;
            this._authenticationInfoFactory = authenticationInfoFactory;
        }

        // GET: api/user/impersonate
        [HttpGet]
        [Route("")]
        public async Task<IEnumerable<AppImpersonationUserListing>> Get() {
            AppUser currentUser = await this.GetCurrentUser();

            return (
                currentUser.AvailableImpersonations
                .Where(x => x.IsActive)
                .OrderBy(x => x.TargetUser.UserName)
                .Select(token => new AppImpersonationUserListing {
                    UserName = token.TargetUser.UserName,
                    Email = token.TargetUser.Email,
                    ActiveSince = token.CreationDate,
                    Id = token.TargetUser.Id,
                    GroupId = token.Group.Id
                })).ToList();
        }

        [HttpGet]
        [Route("allowed-impersonation")]
        [ReadOnlyApi]
        public async Task<IEnumerable<AppAllowedImpersonation>> GetAllowedImpersonations() {
            AppUser currentUser = await this.GetCurrentUser();
            IEnumerable<AppUserTrustedUser> allowedImpersonations = await this._appImpersonationTokenService.GetAllowedImpersonations(currentUser);

            return (allowedImpersonations
                    .OrderBy(x => x.TargetUser.UserName)
                    .Select(token => new AppAllowedImpersonation {
                        UserName = token.SourceUser.UserName,
                        Email = token.SourceUser.Email,
                        ActiveSince = token.CreationDate,
                        SecurityToken = token.SecurityToken,
                        Id = token.SourceUser.Id
                    })).ToList();
        }

        [HttpDelete]
        [Route("allowed-impersonation")]
        public async Task<IActionResult> DeleteAllowedImpersonation([FromBody]SecurityTokenModel securityToken) {
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            AppUser currentUser = await this.GetCurrentUser();
            await this._appImpersonationTokenService.DeleteAllowedImpersonation(currentUser, securityToken.SecurityToken);

            return this.NoContent();
        }

        [HttpGet]
        [Route("outstanding")]
        [ReadOnlyApi]
        public async Task<IEnumerable<OutstandingImpersonation>> GetOutstandingImpersonations() {
            AppUser currentUser = await this.GetCurrentUser();

            return (from trustedUser in this._appImpersonationTokenService.GetOutstandingImpersonations(currentUser)
                   select CreateOutstandingImpersonationModel(trustedUser)).ToList();
        }

        [HttpDelete]
        [Route("outstanding")]
        public async Task<IActionResult> DeleteOutstandingInvitation([FromBody]SecurityTokenModel securityToken) {
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            AppUser currentUser = await this.GetCurrentUser();
            await this._appImpersonationTokenService.DeleteImpersonationToken(currentUser, securityToken.SecurityToken);

            return this.NoContent();
        }

        [HttpPost]
        [Route("create-invitation")]
        public async Task<OutstandingImpersonation> CreateImpersonationInvite() {
            AppUser currentUser = await this.GetCurrentUser();

            AppUserTrustedUser impersonationToken = await this._appImpersonationTokenService.CreateImpersonationInvite(currentUser);

            return CreateOutstandingImpersonationModel(impersonationToken);
        }

        [HttpPost]
        [Route("complete-invitation")]
        public async Task<IActionResult> CompleteImpersonationInvite([FromBody]SecurityTokenModel securityToken) {
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            AppUser currentUser = await this.GetCurrentUser();

            try {
                await this._appImpersonationTokenService.CompleteImpersonationInvite(currentUser, securityToken.SecurityToken);
            }
            catch (ImpersonationNotAllowedException) {
                this.ModelState.AddModelError(nameof(securityToken.SecurityToken), "Ongeldige beveiligingscode");
                return this.BadRequest(this.ModelState);
            }

            return this.NoContent();
        }

        // POST: api/user/impersonate/3
        [HttpPost]
        [Route("{id}")]
        public async Task<AuthenticationInfo> Impersonate(int id) {
            AppUser currentUser = await this.GetCurrentUser();

            try {
                AppOwner impersonationGroup =
                    await this._appImpersonationTokenService.GetImpersonationUserGroup(currentUser, id);

                await this._appOwnerTokenChangeService.ChangeActiveGroupAsync(this.User, currentUser, impersonationGroup, this.HttpContext);

                return await this._authenticationInfoFactory.CreateAsync(currentUser, this.User);
            }
            catch (ImpersonationNotAllowedException) {
                throw new HttpStatusException(HttpStatusCode.Forbidden);
            }
        }

        private static OutstandingImpersonation CreateOutstandingImpersonationModel(AppUserTrustedUser trustedUser) {
            return new OutstandingImpersonation {
                CreationDate = trustedUser.CreationDate,
                SecurityToken = trustedUser.SecurityToken
            };
        }

        private Task<AppUser> GetCurrentUser() {
            int currentUserId = this.User.Identity.GetUserId();

            return this._appUserManager.Users.Include(x => x.AvailableImpersonations).ThenInclude(x => x.TargetUser).FirstOrDefaultAsync(x => x.Id == currentUserId).EnsureNotNull(HttpStatusCode.Forbidden);
        }
    }
}