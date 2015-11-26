namespace App.Support.Integration {
    using Microsoft.AspNet.Builder;
    using Microsoft.AspNet.Hosting;

    public static class AngularViewExtensions {
        public static void MapAngularViewPath(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment) {
            app.Map("/Angular", a => a.UseAngularMobileViews().UseAngularViewCaching().UseStaticFilesOnRelativePath(hostingEnvironment, "./Angular/"));
        }

        public static IApplicationBuilder UseAngularViewCaching(this IApplicationBuilder app) {
            return app.UseMiddleware<AngularViewCacheMiddleware>();
        }

        public static IApplicationBuilder UseAngularMobileViews(this IApplicationBuilder app) {
            return app.UseMiddleware<AngularViewMobileMiddleware>();
        }
    }
}