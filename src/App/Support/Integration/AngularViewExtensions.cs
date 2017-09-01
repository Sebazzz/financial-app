namespace App.Support.Integration {
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;

    public static class AngularViewExtensions {
        public static void MapAngularViewPath(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment) {
            app.Map("/ko-templates", a => a.UseAngularMobileViews().UseAngularViewCaching().UseStaticFilesOnRelativePath(hostingEnvironment, "./ko-templates/"));
        }

        public static IApplicationBuilder UseAngularViewCaching(this IApplicationBuilder app) {
            return app.UseMiddleware<AngularViewCacheMiddleware>();
        }

        public static IApplicationBuilder UseAngularMobileViews(this IApplicationBuilder app) {
            return app.UseMiddleware<AngularViewMobileMiddleware>();
        }
    }
}