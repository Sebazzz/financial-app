// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : BuildVersionCache.cs
//  Project         : App
// ******************************************************************************
using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;

namespace App.Support
{
    using Microsoft.Extensions.Hosting;

    public interface IBuildAssetVersionCache {
        string MatchFile(string path);
    }

    public sealed class BuildAssetVersionCache : IBuildAssetVersionCache
    {
        private const string Extension = ".js";

        private readonly IWebHostEnvironment _hostingEnvironment;

        private readonly ConcurrentDictionary<string, string> _lookupCache;
        private readonly ConcurrentDictionary<string, IChangeToken> _fileWatcherCache;

        private readonly ILogger<BuildAssetVersionCache> _logger;

        /// <inheritdoc />
        public BuildAssetVersionCache(IWebHostEnvironment hostingEnvironment, ILogger<BuildAssetVersionCache> logger)
        {
            this._hostingEnvironment = hostingEnvironment;
            this._logger = logger;

            this._lookupCache = new ConcurrentDictionary<string, string>(
                StringComparer.OrdinalIgnoreCase
            );
            this._fileWatcherCache = new ConcurrentDictionary<string, IChangeToken>(
                StringComparer.OrdinalIgnoreCase
            );
        }

        public string MatchFile(string path)
        {
            if (string.IsNullOrEmpty(path))
            {
                return null;
            }
            
            if (!path.EndsWith(Extension, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return this._lookupCache.GetOrAdd(path, this.MatchFileCore);
        }

        private string MatchFileCore(string path)
        {
            using (this._logger.BeginScope("Look-up for path: " + path))
            {
                bool slashPrefix = path[0].Equals('/');
                if (slashPrefix)
                {
                    path = path.Substring(1);
                }

                IFileProvider fileProvider = this._hostingEnvironment.WebRootFileProvider;

                // If we match straight away, don't bother
                IFileInfo straightMatch = fileProvider.GetFileInfo(path);
                if (straightMatch.Exists)
                {
                    this._logger.LogDebug($"Straight match via file path {straightMatch.PhysicalPath}");
                    return path;
                }

                // Directory, attempt search in directory
                string file = Path.GetFileName(path);

                // Remove the ultimate extension to get the parts. The last part can be the file hash.
                file = file.Substring(0, file.Length - Extension.Length);

                string[] parts = file.Split('.');
                if (parts.Length > 1)
                {
                    file = string.Join('.', parts, 0, parts.Length - 1);
                }

                string pattern = file + ".*" + Extension;

                string webDirectoryPath = Path.GetDirectoryName(path);

                this._logger.LogDebug($"Matching files in {webDirectoryPath} according to pattern [{pattern}]");

                // Enumerate and find the latest written file
                DateTimeOffset lastWriteTime = DateTimeOffset.MinValue;
                IFileInfo newestFile = null;

                foreach (IFileInfo currentFile in fileProvider.GetDirectoryContents(webDirectoryPath))
                {
                    Debug.Assert(currentFile.Exists);

                    bool isMatch = currentFile.Name.StartsWith(file + ".", StringComparison.OrdinalIgnoreCase) &&
                                   currentFile.Name.EndsWith(Extension, StringComparison.OrdinalIgnoreCase);
                    if (!isMatch)
                    {
                        continue;
                    }

                    DateTimeOffset currentFileWriteTime = currentFile.LastModified;

                    if (currentFileWriteTime > lastWriteTime)
                    {
                        lastWriteTime = currentFileWriteTime;
                        newestFile = currentFile;
                    }
                }

                if (newestFile == null)
                {
                    this._logger.LogInformation($"No matching files in {webDirectoryPath} according to pattern [{pattern}]");
                    return null;
                }

                // Create new path
                string newPath = webDirectoryPath + "/" +newestFile.Name;

                this._logger.LogInformation($"Returning path {newPath} from {newestFile}");

                // Create watcher for directory
                if (this._hostingEnvironment.IsDevelopment())
                {
                    this._fileWatcherCache.GetOrAdd(webDirectoryPath, this.InitFileWatcher);
                }

                return newPath;
            }
        }

        private IChangeToken InitFileWatcher(string directoryPath)
        {
            string pattern = directoryPath + "/**/*";

            this._logger.LogDebug($"Initialize watcher for directory {pattern}");
            IChangeToken watcher = this._hostingEnvironment.WebRootFileProvider.Watch(pattern);

            if (!watcher.ActiveChangeCallbacks)
            {
                this._logger.LogWarning("File watcher does not support active callbacks. File lookup cache refresh not supported.");
                return watcher;
            }

            watcher.RegisterChangeCallback(_ => this.OnFileDirectoryChanged(), null);
            return null;
        }

        private void OnFileDirectoryChanged()
        {
            // Purge cache
            this._fileWatcherCache.Clear();
            this._lookupCache.Clear();
        }
    }
}
