using Microsoft.AspNetCore.Builder;

namespace App.Support.Https
{
    public static class HttpsMiddlewareExtensions
    {
        public static IApplicationBuilder UseHttps(this IApplicationBuilder app)
        {
            return app.UseMiddleware<HttpsMiddleware>();
        }
    }
}