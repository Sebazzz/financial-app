namespace App.Api {
    using System.Web.Http;
    using Extensions;
    using Models.Domain.Services;

    [Authorize]
    [ValidationExceptionFilter]
    public abstract class BaseEntityController : ApiController {
        protected readonly EntityOwnerService EntityOwnerService;

        protected BaseEntityController(EntityOwnerService entityOwnerService) {
            this.EntityOwnerService = entityOwnerService;
        }

        protected int OwnerId
        {
            get { return this.User.Identity.GetOwnerGroupId(); }
        }
    }
}