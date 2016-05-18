namespace App.Support.Filters {
    using System;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Http.Headers;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Net.Http.Headers;

    public sealed class DefaultResponseCacheFilterAttribute : ActionFilterAttribute {
        public override void OnResultExecuting(ResultExecutingContext context) {
            ResponseHeaders headers = context.HttpContext.Response.GetTypedHeaders();

            headers.CacheControl = new CacheControlHeaderValue {
                MustRevalidate = false,
                Public = true,
                MaxAge = TimeSpan.FromDays(1)
            };

            base.OnResultExecuting(context);
        }
    }
}