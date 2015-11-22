namespace App.Support.Filters {
    using System;
    using Microsoft.AspNet.Http;
    using Microsoft.AspNet.Http.Headers;
    using Microsoft.AspNet.Mvc.Filters;

    public sealed class DefaultResponseCacheFilterAttribute : ActionFilterAttribute {
        public override void OnResultExecuting(ResultExecutingContext context) {
            ResponseHeaders headers = context.HttpContext.Response.GetTypedHeaders();

            headers.CacheControl.MustRevalidate = false;
            headers.CacheControl.Public = true;
            headers.CacheControl.MaxAge = TimeSpan.FromDays(1);

            base.OnResultExecuting(context);
        }
    }
}