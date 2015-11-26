namespace App.Support.Integration {
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using Microsoft.AspNet.Builder;
    using Microsoft.AspNet.FileProviders;
    using Microsoft.AspNet.Hosting;
    using Microsoft.AspNet.Http;

    public sealed class AngularViewMobileMiddleware {
        private readonly RequestDelegate _next;
        private readonly IFileProvider _fileProvider;

        public AngularViewMobileMiddleware(RequestDelegate next, IHostingEnvironment hostingEnv) {
            this._next = next;
            this._fileProvider = hostingEnv.WebRootFileProvider;
        }

        public async Task Invoke(HttpContext context) {
            const string mobileSuffix = "mobile.html";

            string pathValue = context.Request.PathBase.Add(context.Request.Path);
            if (pathValue.EndsWith("." + mobileSuffix, StringComparison.OrdinalIgnoreCase)) {
                await this._next(context);
                return;
            }

            string mobilePath = Path.ChangeExtension(pathValue, mobileSuffix);
            if (this._fileProvider.GetFileInfo(mobilePath).Exists) {
                context.Request.Path = Path.ChangeExtension(context.Request.Path.Value, mobileSuffix);
            }

            await this._next(context);
        }
    }
}