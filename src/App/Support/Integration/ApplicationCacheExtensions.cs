namespace App.Support.Integration {
    using Microsoft.AspNet.Builder;

    public static class ApplicationCacheExtensions {
        public static void MapApplicationCacheManifest(this IApplicationBuilder app) {
            app.Map("application.appcache", a => a.UseApplicationCacheManifest());
        }

        public static IApplicationBuilder UseApplicationCacheManifest(this IApplicationBuilder app) {
            return app.UseMiddleware<ApplicationCacheMiddleware>();
        }
    }
}