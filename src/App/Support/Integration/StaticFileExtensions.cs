namespace App.Support.Integration {
    using System.IO;
    using Microsoft.AspNet.Builder;
    using Microsoft.AspNet.FileProviders;
    using Microsoft.AspNet.Hosting;
    using Microsoft.AspNet.StaticFiles;

    public static class StaticFileExtensions {
        public static IApplicationBuilder UseStaticFilesOnRelativePath(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment, string relativePath) {
            return app.UseStaticFiles(new StaticFileOptions {
                FileProvider = new PhysicalFileProvider(Path.Combine(hostingEnvironment.WebRootPath, relativePath))
            });
        }
    }
}