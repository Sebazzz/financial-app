namespace App.Support {
    using System;
    using System.IO;
    using System.Text;
    using System.Text.RegularExpressions;
    using System.Web;
    using System.Web.Optimization;

    public class AppCacheGenerator : IHttpHandler {
        private static readonly Regex AppViewDirective = new Regex(
            @"^\/Angular\/(?<first>[A-z/]+)\.html(\s\/Angular\/(?<second>[A-z/]+)\.html)?$",
            RegexOptions.Compiled | RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture | RegexOptions.Singleline);

        /// <summary>
        /// Enables processing of HTTP Web requests by a custom HttpHandler that implements the <see cref="T:System.Web.IHttpHandler"/> interface.
        /// </summary>
        /// <param name="context">An <see cref="T:System.Web.HttpContext"/> object that provides references to the intrinsic server objects (for example, Request, Response, Session, and Server) used to service HTTP requests. </param>
        public void ProcessRequest(HttpContext context) {
            string appCachePath = context.Server.MapPath("~/application.appcache");
            
            // response
            HttpResponse response = context.Response;
            response.AddFileDependency(appCachePath);
            foreach (Bundle bundle in BundleTable.Bundles) {
                BundleContext bctx = new BundleContext(new HttpContextWrapper(context), BundleTable.Bundles, bundle.Path);
                foreach (BundleFile file in bundle.EnumerateFiles(bctx)) {
                    string resolvedPath = context.Server.MapPath(file.IncludedVirtualPath);
                    response.AddFileDependency(resolvedPath);
                }
            }

            response.ContentEncoding = Encoding.UTF8;
            response.ContentType = "text/cache-manifest";
            response.Cache.SetCacheability(HttpCacheability.ServerAndPrivate);
            response.Cache.SetETagFromFileDependencies();
            response.Cache.SetLastModifiedFromFileDependencies();
            response.Cache.VaryByParams.IgnoreParams = true;

            // read each line and transform as required
            using (StreamReader reader = new StreamReader(appCachePath)) {
                string line;

                while ((line = reader.ReadLine()) != null) {
                    int index;
                    Match match;
                    if ((index = line.IndexOf("{version}", StringComparison.OrdinalIgnoreCase)) != -1) {
                        line = line.Substring(0, index) + AppVersion.Informational + line.Substring(index + "{version}".Length);
                    } else if ((line.IndexOf("/bundles", StringComparison.OrdinalIgnoreCase)) != -1) {
                        string bundleAddress = "~" + line;
                        bool isScript = line.IndexOf("script", StringComparison.OrdinalIgnoreCase) != -1;
                        line = (isScript ? Scripts.Url(bundleAddress) : Styles.Url(bundleAddress)).ToHtmlString();
                        line = context.Server.HtmlDecode(line);
                    } else if ((match = AppViewDirective.Match(line)).Success) {
                        line = MakeViewUrl(match.Groups["first"].Value);

                        Group secondGroup;
                        if ((secondGroup = match.Groups["second"]) != null && secondGroup.Success) {
                            line += " " + MakeViewUrl(secondGroup.Value);
                        }
                    }

                    context.Response.Write(line);
                    context.Response.Write(Environment.NewLine);
                }
            }
        }

        private static string MakeViewUrl(string relativeFilePathWithoutExtension) {
            return "/Angular/" + relativeFilePathWithoutExtension + ".html?v=" + AppVersion.Informational;
        }

        /// <summary>
        /// Gets a value indicating whether another request can use the <see cref="T:System.Web.IHttpHandler"/> instance.
        /// </summary>
        /// <returns>
        /// true if the <see cref="T:System.Web.IHttpHandler"/> instance is reusable; otherwise, false.
        /// </returns>
        public bool IsReusable
        {
            get { return true; }
        }
    }
}