namespace App.Support {
    using System.Diagnostics;
    using System.Reflection;
    using Controllers;

    /// <summary>
    /// Helper class for getting the app version
    /// </summary>
    public static class AppVersion {
        public static readonly string Informational = InitVersion();
        private static string InitVersion() {
            Assembly assembly = typeof (HomeController).GetTypeInfo().Assembly;

            AssemblyFileVersionAttribute versionAttr =
                assembly.GetCustomAttribute<AssemblyFileVersionAttribute>();
            Debug.Assert(versionAttr != null, "This should not be null. Was the assembly properly built?");
            return versionAttr.Version;
        }
    }
}