namespace App.Controllers {
    using System;
    using System.IO;
    using System.Web;

    /// <summary>
    /// Rewrites requests to angular views to mobile versions if they are available
    /// </summary>
    public class AngularViewRewriteModule : IHttpModule {
        public void Dispose() {
            // -- nothing to dispose of
        }

        public void Init(HttpApplication context) {
            context.BeginRequest += OnBeginRequest;
        }

        private static void OnBeginRequest(object sender, EventArgs e) {
            HttpApplication app = (HttpApplication) sender;

            string path = app.Request.Path;
            if (path.EndsWith(".mobile.html", StringComparison.OrdinalIgnoreCase) || !app.Request.Browser.IsMobileDevice) {
                return;
            }

            string mobilePath = Path.ChangeExtension(path, "mobile.html");
            if (File.Exists(app.Server.MapPath(mobilePath))) {
                app.Context.RewritePath(mobilePath, true);
            }
        }
    }
}