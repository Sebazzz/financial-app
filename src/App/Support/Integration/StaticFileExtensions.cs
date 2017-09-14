namespace App.Support.Integration {
    using System.IO;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.FileProviders;

    public static class StaticFileExtensions {
        public static IApplicationBuilder UseStaticFilesOnRelativePath(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment, string relativePath) {
            return app.UseStaticFiles(new StaticFileOptions {
                FileProvider = new PhysicalFileProvider(Path.Combine(hostingEnvironment.WebRootPath, relativePath))
            });
        }
    }
}