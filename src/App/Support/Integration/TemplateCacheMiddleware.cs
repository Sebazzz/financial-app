namespace App.Support.Integration {
    using System;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Net.Http.Headers;

    public sealed class TemplateCacheMiddleware {
        private readonly RequestDelegate _next;

        public TemplateCacheMiddleware(RequestDelegate next) {
            this._next = next;
        }

        public async Task Invoke(HttpContext context) {
            context.Response.OnStarting(delegate {
                var response = context.Response;
                var contentType = response.ContentType;
                var headers = response.GetTypedHeaders();
                var cache = headers.CacheControl ?? (headers.CacheControl = new CacheControlHeaderValue());

                response.Headers.Clear();

                response.ContentType = contentType;

                cache.Private = true;
                cache.MaxAge = TimeSpan.FromDays(365);
                cache.MustRevalidate = false;

                if (response.StatusCode == 200 || response.StatusCode == 304) {
                    cache.Extensions.Add(new NameValueHeaderValue("Vary", "*"));
                }

                return Task.FromResult(0);
            });

            await this._next(context);
        }
    }
}