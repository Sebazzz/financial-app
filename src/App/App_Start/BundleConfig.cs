namespace App {
    using System.Web.Optimization;

    public class BundleConfig {

        public static void Register() {
            Configure(BundleTable.Bundles);
        }

        private static void Configure(BundleCollection bundles) {
            // libraries
            bundles.Add(
                new ScriptBundle("~/bundles/script-lib")
                    .Include("~/Scripts/moment-with-locales.js",
                             "~/Scripts/linq.js",
                             "~/Scripts/angular.js",
                             "~/Scripts/angular-locale-nl_NL.js",
                             "~/Scripts/angular-resource.js",
                             "~/Scripts/angular-route.js",
                             "~/Scripts/angular-progress.js",
                             "~/Scripts/angular-ui/ui-bootstrap-tpls.js",
                             "~/Scripts/hotkeys.js",
                             "~/Scripts/angular-ng-google-chart.js"
                             ));

            bundles.Add(
                new StyleBundle("~/bundles/style-lib")
                    .Include("~/Content/animate.css")
                    .Include("~/Content/bootstrap.css")
                    .Include("~/Content/angular-progress.css"));

            // own
            ScriptBundle appScriptBundle =
                new ScriptBundle("~/bundles/script-app");
            appScriptBundle.IncludeDirectory("~/Scripts/App", "*.js", true);
            appScriptBundle.Transforms.Add(new JsMinify());

            bundles.Add(appScriptBundle);

            StyleBundle appStyleBundle = new StyleBundle("~/bundles/style-app");
            appStyleBundle.Include("~/Content/App/01Main.css", new CssRewriteUrlTransform());
            appStyleBundle.Include("~/Content/App/02Anonymous.css", new CssRewriteUrlTransform());
            appStyleBundle.Include("~/Content/App/03Authenticated.css", new CssRewriteUrlTransform());
            appStyleBundle.Transforms.Add(new CssMinify());

            bundles.Add(appStyleBundle);
        }
    }
}