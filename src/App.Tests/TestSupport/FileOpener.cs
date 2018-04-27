// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : FileOpener.cs
//  Project         : App.Tests
// ******************************************************************************

namespace App.Tests.TestSupport {
    using System.IO;
    using System.Runtime.CompilerServices;
    using NUnit.Framework;

    internal static class FileOpener {
        public static string GetMailExample(string part, [CallerMemberName] string member = null) {
            return GetFile("Mailing/Examples", CombineFileName(part, "html", member));
        }

        public static string CombineFileName(string part, string extension, [CallerMemberName] string member = null) {
            return $"{member}.{part}.{extension}";
        }

        private static string GetFile(string subPath, string name) {
            string fullPath = Path.GetFullPath(Path.Combine(subPath, name));
            TestContext.WriteLine($"{nameof(FileOpener)}: Returning contents of {fullPath}");

            return File.ReadAllText(fullPath);
        }
    }
}