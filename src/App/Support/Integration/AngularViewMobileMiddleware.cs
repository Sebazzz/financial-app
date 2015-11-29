namespace App.Support.Integration {
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using Microsoft.AspNet.Builder;
    using Microsoft.AspNet.FileProviders;
    using Microsoft.AspNet.Hosting;
    using Microsoft.AspNet.Http;
    using Microsoft.Extensions.Logging;

    public sealed class AngularViewMobileMiddleware {
        private readonly RequestDelegate _next;
        private readonly IFileProvider _fileProvider;
        private readonly IBrowserDetector _browserDetector;
        private readonly ILogger _logger;

        public AngularViewMobileMiddleware(RequestDelegate next, IHostingEnvironment hostingEnv, IBrowserDetector browserDetector, ILoggerFactory loggerFactory) {
            this._next = next;
            this._browserDetector = browserDetector;
            this._fileProvider = hostingEnv.WebRootFileProvider;
            this._logger = loggerFactory.CreateLogger<AngularViewMobileMiddleware>();
        }

        public async Task Invoke(HttpContext context) {
            if (!this._browserDetector.IsMobileDevice()) {
                await this._next(context);
                return;
            }

            // if we're already visiting the mobile view for some reason, skip it
            const string mobileSuffix = "Mobile.html";

            string pathValue = context.Request.PathBase.Add(context.Request.Path);
            if (pathValue.EndsWith("." + mobileSuffix, StringComparison.OrdinalIgnoreCase)) {
                this._logger.LogVerbose(0, "Notice: Already requesting mobile view via path {0}", pathValue);

                await this._next(context);
                return;
            }

            string mobilePath = Path.ChangeExtension(pathValue, mobileSuffix);
            if (this._fileProvider.GetFileInfo(mobilePath).Exists) {
                context.Request.Path = Path.ChangeExtension(context.Request.Path.Value, mobileSuffix);

                this._logger.LogVerbose(0, "Rewriting mobile field path from {0} to {1}", pathValue, context.Request.Path.Value);
            }

            await this._next(context);
        }
    }
}