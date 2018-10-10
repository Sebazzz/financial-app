// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : HttpStatusExceptionFilterAttribute.cs
//  Project         : App
// ******************************************************************************
namespace App.Api.Extensions {
    using System;
    using System.Net;

    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Filters;

    public sealed class HttpStatusExceptionFilterAttribute : Attribute, IExceptionFilter {
        public void OnException(ExceptionContext context) {
            switch (context.Exception) {
                case NotFoundException _:
                    context.ExceptionHandled = true;
                    context.Result = new NotFoundObjectResult(context.Exception.Message);
                    break;

                case HttpStatusException statusException:
                    context.ExceptionHandled = true;
                    context.Result = new StatusCodeResult((int) statusException.StatusCode);
                    break;
            }
        }
    }

    public class HttpStatusException : Exception {
        public HttpStatusCode StatusCode { get; set; }

        public HttpStatusException(HttpStatusCode statusCode) {
            this.StatusCode = statusCode;
        }
    }

    public class NotFoundException : Exception {
        public NotFoundException(string message) : base(message) { }
        public NotFoundException(string message, Exception innerException) : base(message, innerException) { }
    }
}
