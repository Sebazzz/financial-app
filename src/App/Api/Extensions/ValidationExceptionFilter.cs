namespace App.Api.Extensions {
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Data.Entity.Validation;
    using System.Linq;
    using System.Net;
    using System.Net.Http;
    using System.Text;
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
                throw new HttpResponseException(
                    CreateResponseMessage(actionExecutedContext.Request, actionExecutedContext.Exception));
            }
        }

        private static HttpResponseMessage CreateResponseMessage(HttpRequestMessage request, Exception ex) {
            if (ex is ValidationException) {
                return CreateResponseMessage(request, (ValidationException) ex);
            }

            return CreateResponseMessage(request, (DbEntityValidationException) ex);
        }

        private static HttpResponseMessage CreateResponseMessage(HttpRequestMessage request, DbEntityValidationException dbEntityValidationException) {
            List<object> validationErrors = new List<object>();
            
            foreach (DbEntityValidationResult error in dbEntityValidationException.EntityValidationErrors) {
                validationErrors.Add(new {
                                             entityType = error.Entry.Entity.GetType(),
                                             errors = error.ValidationErrors
                                         });
            }

            return request.CreateResponse(HttpStatusCode.BadRequest, validationErrors);
        }

        private static HttpResponseMessage CreateResponseMessage(HttpRequestMessage request, ValidationException validationException) {
            return request.CreateResponse(HttpStatusCode.BadRequest, validationException.ValidationResult);
        }
    }
}