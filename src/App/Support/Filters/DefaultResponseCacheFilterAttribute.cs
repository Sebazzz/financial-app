namespace App.Support.Filters {
    using System;
    using Microsoft.AspNet.Http;
    using Microsoft.AspNet.Http.Headers;
    using Microsoft.AspNet.Mvc.Filters;
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