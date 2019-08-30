// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : EnvironmentPath.cs
//  Project         : App
// ******************************************************************************

namespace App.Support {
    using System;
    using System.IO;
    using System.Runtime.InteropServices;

    public static class EnvironmentPath {
        private const string AppSpecificFolder = "financial-app";

        public static string CreatePath(string subPath)
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                return MakeWin32FilePath(subPath);
            }

            if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                return MakeUnixFilePath(subPath);
            }

            throw new InvalidOperationException($"Unsupported platform family '{RuntimeInformation.OSDescription}'");
        }

        private static string MakeWin32FilePath(string subPath)
        {
            return Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                AppSpecificFolder,
                subPath
            );
        }

        private static string MakeUnixFilePath(string subPath)
        {
            return Path.Combine(
                "/etc",
                AppSpecificFolder,
                subPath
            );
        }
    }
}
