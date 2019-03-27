// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : EnvironmentPath.cs
//  Project         : App
// ******************************************************************************

namespace App.Support {
    using System;
    using System.IO;

    public static class EnvironmentPath {
        private const string AppSpecificFolder = "financial-app";

        public static string CreatePath(string subPath)
        {
            switch (Environment.OSVersion.Platform)
            {
                case PlatformID.Win32NT:
                    return MakeWin32FilePath(subPath);
                case PlatformID.Unix:
                    return MakeUnixFilePath(subPath);

                default:
                    throw new InvalidOperationException($"Unsupported platform family '{Environment.OSVersion.Platform}' of {Environment.OSVersion}");
            }
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
