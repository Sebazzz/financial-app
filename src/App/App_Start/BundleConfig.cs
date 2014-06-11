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
                    .Include("~/Scripts/jquery-{version}.js",
                             "~/Scripts/bootstrap.js",
                             "~/Scripts/moment-with-langs.js",
                             "~/Scripts/angular.js",
                             "~/Scripts/angular-resource.js",
                             "~/Scripts/angular-route.js",
                             "~/Scripts/angular-progress.js"));

            bundles.Add(
                new StyleBundle("~/bundles/style-lib")
                    .Include("~/Content/bootstrap.css")
                    .Include("~/Content/bootstrap-theme.css")
                    .Include("~/Content/angular-progress.css"));

            // own
            ScriptBundle appScriptBundle =
                new ScriptBundle("~/bundles/script-app");
            appScriptBundle.IncludeDirectory("~/Scripts/App", "*.js", true);
            appScriptBundle.Transforms.Add(new JsMinify());

            bundles.Add(appScriptBundle);

            StyleBundle appStyleBundle = new StyleBundle("~/bundles/style-app");
            appStyleBundle.IncludeDirectory("~/Content/App", "*.css");
            appStyleBundle.Transforms.Add(new CssMinify());

            bundles.Add(appStyleBundle);
        }
    }
}