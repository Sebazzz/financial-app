// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppVersion.cs
//  Project         : App
// ******************************************************************************
namespace App.Support {
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Diagnostics.CodeAnalysis;
    using System.Linq;
    using System.Reflection;
    using Microsoft.Extensions.FileProviders;
    using Microsoft.AspNetCore.Hosting;

    public interface IAppVersionService {
        string GetVersionIdentifier();
        string GetVersion();
    }

    public sealed class AppVersionService : IAppVersionService {
        private readonly string _informational = InitVersion();
        private readonly IWebHostEnvironment _hostingEnvironment;
        private string _cachedAppVersion;

        private static string InitVersion() {
            Assembly assembly = typeof (AppVersionService).GetTypeInfo().Assembly;

            var versionAttr =
                assembly.GetCustomAttribute<AssemblyFileVersionAttribute>();
            Debug.Assert(versionAttr != null, "This should not be null. Was the assembly properly built?");
            return versionAttr.Version;
        }

        internal static string GetInformationalVersion() => InitVersion();

        public AppVersionService(IWebHostEnvironment hostingEnvironment) {
            this._hostingEnvironment = hostingEnvironment;
        }

        public string GetVersion() {
            return this._informational;
        }

        public string GetVersionIdentifier() {
            return this._cachedAppVersion ?? (this._cachedAppVersion = this.GetVersion() + '_' + this.GenerateVersionIdentifier());
        }

        [SuppressMessage("ReSharper", "LoopCanBeConvertedToQuery", Justification = "Clarity of code")]
        private string GenerateVersionIdentifier() {
            long fileLength = 0;

            IDirectoryContents buildContents = this._hostingEnvironment.WebRootFileProvider.GetDirectoryContents("build");
            IDirectoryContents viewContents = this._hostingEnvironment.WebRootFileProvider.GetDirectoryContents("ko-templates");
            IEnumerable<IFileInfo> allFiles = Enumerable.Empty<IFileInfo>().Union(buildContents).Union(viewContents);

            // we get a 'reasonably good' hash of the application
            // currently we cannot use Fody to print in the git commit number so we'Il have to do it like this
            int index = 0;
            foreach (IFileInfo file in allFiles) {
                fileLength = (file.Length << index++) ^ fileLength;
                fileLength ^= file.LastModified.ToUnixTimeSeconds();
            }

            return Convert.ToString(fileLength, 16);
        }
    }
}