namespace App.Support {
    using System.Diagnostics;
    using System.Reflection;
    using Controllers;

    /// <summary>
    /// Helper class for getting the app version
    /// </summary>
    public static class AppVersion {
        public static readonly string Informational = InitVersion();
        private static string InitVersion()
        {
            var versionAttr =
                typeof(HomeController).Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>();
            Debug.Assert(versionAttr != null, "This should not be null. Was the assembly properly built?");
            return versionAttr.InformationalVersion;
        }
    }
}