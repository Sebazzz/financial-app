// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : HttpsMiddleware.cs
//  Project         : App
// ******************************************************************************
using System;
using System.Threading.Tasks;
using Microsoft.ApplicationInsights.AspNetCore.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace App.Support.Https
{
    public sealed class HttpsMiddleware
    {
        private readonly HttpsServerOptions _httpsServerOptions;
        private readonly RequestDelegate _next;

        public HttpsMiddleware(IOptions<HttpsServerOptions> httpsOptions, RequestDelegate next)
        {
            this._httpsServerOptions = httpsOptions.Value;
            this._next = next;
        }

        public Task Invoke(HttpContext context)
        {
            if (this._httpsServerOptions == null) return this._next.Invoke(context);

            HttpRequest request = context.Request;
            HttpResponse response = context.Response;
            if (request.IsHttps)
            {
                if (this._httpsServerOptions.UseStrongHttps) {
                    int maxAge = (int)TimeSpan.FromDays(1).TotalSeconds;
                    response.Headers.Append("Strict-Transport-Security", $"max-age={maxAge}");

                    response.Headers.Append("Content-Security-Policy", "upgrade-insecure-requests");
                }
            }

            return this._next.Invoke(context);
        }
    }
}