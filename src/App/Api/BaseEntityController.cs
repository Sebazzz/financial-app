namespace App.Api {
    using System.Web.Http;
    using Extensions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    using Models.Domain.Services;

    [Authorize]
    [ValidationExceptionFilter]
    public abstract class LegacyBaseEntityController : ApiController {
        protected readonly EntityOwnerService EntityOwnerService;

        protected LegacyBaseEntityController(EntityOwnerService entityOwnerService) {
            this.EntityOwnerService = entityOwnerService;
        }

        protected int OwnerId => this.User.Identity.GetOwnerGroupId();
    }

    [Authorize]
    [ValidationExceptionFilter]
    public abstract class BaseEntityController : Controller {
        protected readonly EntityOwnerService EntityOwnerService;

        protected BaseEntityController(EntityOwnerService entityOwnerService) {
            this.EntityOwnerService = entityOwnerService;
        }

        protected int OwnerId => this.User.Identity.GetOwnerGroupId();
    }
}