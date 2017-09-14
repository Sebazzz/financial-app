namespace App.Support.Integration {
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;

    public static class TemplateViewExtensions {
        public static void MapTemplateViewPath(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment) {
            app.Map("/ko-templates", a => a.UseTemplateMobileViews().UseTemplateViewCaching().UseStaticFilesOnRelativePath(hostingEnvironment, "./ko-templates/"));
        }

        public static IApplicationBuilder UseTemplateViewCaching(this IApplicationBuilder app) {
            return app.UseMiddleware<TemplateCacheMiddleware>();
        }

        public static IApplicationBuilder UseTemplateMobileViews(this IApplicationBuilder app) {
            return app.UseMiddleware<TemplateViewMobileMiddleware>();
        }
    }
}