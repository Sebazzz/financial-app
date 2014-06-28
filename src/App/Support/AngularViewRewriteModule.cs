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
            context.PreSendRequestHeaders += OnPreSendRequestHeaders;
        }

        private static void OnPreSendRequestHeaders(object sender, EventArgs e) {
            HttpApplication app = (HttpApplication)sender;

            // if having a 'version' tag in the query string, add caching headers
            if (!String.IsNullOrEmpty(app.Request.QueryString["v"]))
            {
                HttpResponse response = app.Response;

                var contentType = response.ContentType;
                var contentEncoding = response.ContentEncoding;
                var status = response.StatusCode;

                response.ClearHeaders();

                response.StatusCode = status;
                response.ContentEncoding = contentEncoding;
                response.ContentType = contentType;

                response.Cache.SetCacheability(HttpCacheability.ServerAndPrivate);
                response.Cache.SetAllowResponseInBrowserHistory(true);

                response.Cache.SetExpires(DateTime.Now.AddYears(1));
                response.Cache.SetMaxAge(new TimeSpan(365, 0, 0, 0));
                response.Cache.SetValidUntilExpires(true);

                if (response.StatusCode == 200 || response.StatusCode == 304) {
                    response.AddFileDependency(app.Request.PhysicalPath);

                    response.Cache.VaryByParams["v"] = true;
                    response.Cache.SetETagFromFileDependencies();
                }
            }
        }

        private static void OnBeginRequest(object sender, EventArgs e) {
            HttpApplication app = (HttpApplication) sender;

            // rewrite to mobile if required
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