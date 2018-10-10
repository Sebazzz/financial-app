// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DefaultResponseCacheFilterAttribute.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Filters {
    using System;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Http.Headers;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Net.Http.Headers;

    /// <summary>
    /// Ensures the controllers this attribute is applied to allows caching of the HTML
    /// </summary>
    public sealed class DefaultResponseCacheFilterAttribute : ActionFilterAttribute {
        public override void OnResultExecuting(ResultExecutingContext context) {
            ResponseHeaders headers = context.HttpContext.Response.GetTypedHeaders();

            headers.CacheControl = new CacheControlHeaderValue {
                MustRevalidate = true,
                MaxAge = TimeSpan.FromDays(1)
            };
        }
    }
}