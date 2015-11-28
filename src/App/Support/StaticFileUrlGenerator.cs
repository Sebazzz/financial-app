namespace App.Support {
    using System;
    using System.Collections.Concurrent;
    using System.IO;
    using Microsoft.AspNet.FileProviders;
    using Microsoft.AspNet.Hosting;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Primitives;


    /// <summary>
    /// Generates a static file finger printed url, possibility including "min.js" extension
    /// </summary>
    public sealed class StaticFileUrlGenerator : IStaticFileUrlGenerator {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IETagGenerator _fingerPrintGenerator;
        private readonly ILogger _logger;

        private readonly ConcurrentDictionary<string, GeneratedFileInfo> _urlsByPath;

        public StaticFileUrlGenerator(IHostingEnvironment hostingEnvironment, IETagGenerator fingerPrintGenerator, ILoggerFactory loggerFactory) {
            this._hostingEnvironment = hostingEnvironment;
            this._fingerPrintGenerator = fingerPrintGenerator;
            this._logger = loggerFactory.CreateLogger<StaticFileUrlGenerator>();

            this._urlsByPath = new ConcurrentDictionary<string, GeneratedFileInfo>(StringComparer.OrdinalIgnoreCase);
        }
        public string GenerateUrl(string file) {
            GeneratedFileInfo info = this._urlsByPath.GetOrAdd(file, this.GenerateUrlInternalFirstTime);
            
            // anticipate changed file
            if (!info.ChangeToken.ActiveChangeCallbacks && info.ChangeToken.HasChanged) {
                this._logger.LogInformation("File token of url '{0}' is out-of-date. Regenerating.", file);
                info = this._urlsByPath.AddOrUpdate(file, this.GenerateUrlInternalFirstTime, (s,_) => this.GenerateUrlInternalFirstTime(s));
            }

            return info.GeneratedUrl;
        }

        private GeneratedFileInfo GenerateUrlInternalFirstTime(string fileUrl) {
            IFileInfo fileInformation = this.FindFile(fileUrl);
            if (fileInformation == null) {
                return default(GeneratedFileInfo);
            }

            string fileUrlSubst = GetFinalFileUrl(fileInformation.Name, fileUrl);

            IChangeToken token = this.WatchFile(fileUrl, fileUrlSubst);
            string url = this.GetFingerPrintedUrl(fileUrlSubst, fileInformation);

            return new GeneratedFileInfo {
                ChangeToken = token,
                GeneratedUrl = url
            };
        }

        private string GetFingerPrintedUrl(string fileUrl, IFileInfo fileInformation) {
            string fingerPrint = this.GenerateFingerPrint(fileInformation);

            return MakeUrl(fileUrl, fingerPrint);
        }

        private static string MakeUrl(string fileUrl, string fingerPrint) {
            return fileUrl + "?v=" + fingerPrint;
        }

        private static string GetFinalFileUrl(string replaceName, string fileUrl) {
            int fileNameIndex = fileUrl.LastIndexOf('/');
            if (fileNameIndex == -1) {
                throw new ArgumentException("Unable to find file part of url", nameof(fileUrl));
            }

            return fileUrl.Substring(0, fileNameIndex + 1) + replaceName;
        }

        private string GenerateFingerPrint(IFileInfo fileInformation) {
            return this._fingerPrintGenerator.GenerateETag(fileInformation);
        }

        private IChangeToken WatchFile(string key, string fileUrl) {
            IChangeToken token = this._hostingEnvironment.WebRootFileProvider.Watch(fileUrl);

            if (token.ActiveChangeCallbacks) {
                token.RegisterChangeCallback(this.ClearFileFromCache, key);
            }

            return token;
        }

        private void ClearFileFromCache(object key) {
            GeneratedFileInfo removedFromCache;

            if (this._urlsByPath.TryRemove((string) key, out removedFromCache)) {
                this._logger.LogInformation("File has changed: {0}. Removing from cache.", removedFromCache.GeneratedUrl);
            }
        }


        private IFileInfo FindFile(string file) {
            string path = file;

            if (this._hostingEnvironment.IsProduction()) {
                path = this.FindMinifiedFile(file);
            }

            IFileInfo fileInfo = this._hostingEnvironment.WebRootFileProvider.GetFileInfo(path);
            if (!fileInfo.Exists) {
                this._logger.LogError("Unable to find requested file to fingerprint at path '{0}'", path);
                return null;
            }

            return fileInfo;
        }

        private string FindMinifiedFile(string fullFilePath) {
            string extension = Path.GetExtension(fullFilePath);
            string minFilePath = Path.ChangeExtension(fullFilePath, "min" + extension);

            IFileInfo fileInfo = this._hostingEnvironment.WebRootFileProvider.GetFileInfo(minFilePath);
            if (!fileInfo.Exists) {
                this._logger.LogInformation("Unable to find minified file at path {0}, using full file at path {1}.", minFilePath, fullFilePath);
                return fullFilePath;
            }

            this._logger.LogInformation("Using minified file at path '{0}'", minFilePath);
            return minFilePath;
        }

        private struct GeneratedFileInfo {
            public IChangeToken ChangeToken;
            public string GeneratedUrl;
        }
    }
}