namespace App.Support.Integration {
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using Microsoft.AspNet.Builder;
    using Microsoft.AspNet.FileProviders;
    using Microsoft.AspNet.Http;

    public sealed class AngularViewMobileMiddleware {
        private readonly RequestDelegate _next;
        private readonly IFileProvider _fileProvider;

        public AngularViewMobileMiddleware(RequestDelegate next) {
            this._next = next;
            this._fileProvider = new PhysicalFileProvider("/");
        }

        public async Task Invoke(HttpContext context) {
            if (!context.Request.Path.StartsWithSegments("Angular")) {
                await this._next(context);
                return;
            }

            string pathValue = context.Request.Path.Value;
            if (pathValue.EndsWith(".mobile.html", StringComparison.OrdinalIgnoreCase)) {
                await this._next(context);
                return;
            }

            string mobilePath = Path.ChangeExtension(pathValue, "mobile.html");
            if (this._fileProvider.GetFileInfo(mobilePath).Exists) {
                context.Request.Path = new PathString(mobilePath);
            }

            await this._next(context);
        }
    }
}