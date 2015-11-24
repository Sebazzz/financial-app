namespace App.Support.Integration {
    using System;
    using System.Threading.Tasks;
    using Microsoft.AspNet.Builder;
    using Microsoft.AspNet.Http;
    using Microsoft.Net.Http.Headers;

    public sealed class AngularViewCacheMiddleware {
        private readonly RequestDelegate _next;

        public AngularViewCacheMiddleware(RequestDelegate next) {
            this._next = next;
        }

        public async Task Invoke(HttpContext context) {
            if (!context.Request.Path.StartsWithSegments("Angular")) {
                await this._next(context);
                return;
            }

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