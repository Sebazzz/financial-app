namespace App.Support.Integration {
    using Microsoft.AspNet.Builder;

    public static class AngularViewExtensions {
        public static void MapAngularViewPath(this IApplicationBuilder app) {
            app.Map("application.appcache", a => a.UseAngularMobileViews().UseAngularViewCaching().UseStaticFiles());
        }

        public static IApplicationBuilder UseAngularViewCaching(this IApplicationBuilder app) {
            return app.UseMiddleware<AngularViewCacheMiddleware>();
        }

        public static IApplicationBuilder UseAngularMobileViews(this IApplicationBuilder app) {
            return app.UseMiddleware<AngularViewMobileMiddleware>();
        }
    }
}