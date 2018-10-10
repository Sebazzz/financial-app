// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : ApiCachePreventionFilterAttribute.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Filters {
    using System;

    using Controllers;

    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Http.Headers;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Net.Http.Headers;

    public class ApiCachePreventionFilterAttribute : ActionFilterAttribute {
        public override void OnResultExecuting(ResultExecutingContext context) {
            if (context.Controller is HomeController) {
                return;
            }

            HttpResponse response = context.HttpContext.Response;
            ResponseHeaders headers = response.GetTypedHeaders();

            headers.CacheControl = new CacheControlHeaderValue {
                Private = true,
                NoCache = true,
                NoStore = true,
                MaxAge = TimeSpan.Zero
            };
        }
    }
}
