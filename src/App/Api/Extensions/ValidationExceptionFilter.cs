namespace App.Api.Extensions {
    using System.ComponentModel.DataAnnotations;
    using System.Data.Entity.Validation;
    using System.Net;
    using System.Threading;
    using System.Threading.Tasks;
    using System.Web.Http;
    using System.Web.Http.ExceptionHandling;
    using System.Web.Http.Filters;

    public class ValidationExceptionFilterAttribute : ExceptionFilterAttribute {
        /// <summary>
        /// Raises the exception event.
        /// </summary>
        /// <param name="actionExecutedContext">The context for the action.</param>
        public override void OnException(HttpActionExecutedContext actionExecutedContext) {
            if (actionExecutedContext.Exception is ValidationException ||
                actionExecutedContext.Exception is DbEntityValidationException) {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }
    }
}