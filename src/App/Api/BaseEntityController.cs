namespace App.Api {
    using System.Web.Http;
    using Extensions;
    using Microsoft.AspNet.Authorization;
    using Models.Domain.Services;

    [Authorize]
    [ValidationExceptionFilter]
    public abstract class BaseEntityController : ApiController {
        protected readonly EntityOwnerService EntityOwnerService;

        protected BaseEntityController(EntityOwnerService entityOwnerService) {
            this.EntityOwnerService = entityOwnerService;
        }

        protected int OwnerId => this.User.Identity.GetOwnerGroupId();
    }
}