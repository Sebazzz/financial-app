namespace App.Api {
    using Extensions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    using Models.Domain.Services;

    [Authorize]
    public abstract class BaseEntityController : Controller {
        protected readonly EntityOwnerService EntityOwnerService;

        protected BaseEntityController(EntityOwnerService entityOwnerService) {
            this.EntityOwnerService = entityOwnerService;
        }

        protected int OwnerId => this.User.Identity.GetOwnerGroupId();
    }
}