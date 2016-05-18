namespace App.Api.Extensions {
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.Net;
    using System.Net.Http;
    using System.Net.Http.Formatting;
    using System.Web.Http;
    using Microsoft.AspNetCore.Mvc.Filters;

    public class ValidationExceptionFilterAttribute : ExceptionFilterAttribute {
        /// <summary>
        /// Raises the exception event.
        /// </summary>
        /// <param name="exceptionContext">The context for the action.</param>
        public override void OnException(ExceptionContext exceptionContext) {
            if (exceptionContext.Exception is ValidationException) {
                throw new HttpResponseException(CreateResponseMessage(exceptionContext.Exception));
            }
        }

        private static HttpResponseMessage CreateResponseMessage(Exception ex) {
            if (ex is ValidationException) {
                return CreateResponseMessage((ValidationException) ex);
            }

            throw new NotImplementedException();
        }

        private static HttpResponseMessage CreateResponseMessage(ValidationException validationException) {
            return new HttpResponseMessage(HttpStatusCode.BadRequest) {
                Content = new ObjectContent(validationException.ValidationResult.GetType(), validationException.ValidationResult, new JsonMediaTypeFormatter())
            };
        }
    }
}