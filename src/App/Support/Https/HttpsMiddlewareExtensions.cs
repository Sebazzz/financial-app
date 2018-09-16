using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace App.Support.Https
{
    public static class HttpsMiddlewareExtensions
    {
        public static IApplicationBuilder UseHttps(this IApplicationBuilder app)
        {
            var httpsOptions = app.ApplicationServices.GetService<IOptions<HttpsServerOptions>>();

            if (httpsOptions?.Value?.EnableRedirect == true)
            {
                app.UseHttpsRedirection();
            }

            return app.UseMiddleware<HttpsMiddleware>();
        }
    }
}