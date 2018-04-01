// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AccountController.cs
//  Project         : App
// ******************************************************************************

using System.Threading.Tasks;
using App.Api.Extensions;
using App.Models.Domain.Identity;
using App.Models.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Api
{
    [Route("api/account")]
    [Authorize]
    public class AccountController : Controller
    {
        private readonly AppUserManager _appUserManager;
        private readonly AppOwnerRepository _appOwnerRepository;

        /// <inheritdoc />
        public AccountController(AppUserManager appUserManager, AppOwnerRepository appOwnerRepository)
        {
            this._appUserManager = appUserManager;
            this._appOwnerRepository = appOwnerRepository;
        }

        [HttpGet("my-info")]
        public async Task<IActionResult> MyInfo()
        {
            AppUser currentUser = await this._appUserManager.FindByIdAsync(this.User.Identity.GetUserId());

            if (currentUser == null)
            {
                return this.NotFound();
            }

            // Fix not lazily loaded property
            currentUser.Group = await this._appOwnerRepository.FindByIdAsync(currentUser.GroupId);

            return this.Ok(new
            {
                UserName = currentUser.UserName,
                Email = currentUser.Email,
                GroupName = currentUser.Group?.Name
            });
        }
    }
}