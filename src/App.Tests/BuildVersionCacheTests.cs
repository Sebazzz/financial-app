// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : BuildVersionCacheTests.cs
//  Project         : App.Tests
// ******************************************************************************

using System;
using System.IO;
using App.Support;
using App.Tests.TestSupport;
using Microsoft.Extensions.Logging.Abstractions;
using NUnit.Framework;

namespace App.Tests
{
    [TestFixture]
    public sealed class BuildAssetVersionCacheTests
    {
        [Test]
        public void BuildVersionCache_MatchesNoFile_FromUnknownPath()
        {
            // Given
            IBuildAssetVersionCache cache = GetSharedCacheObject(out _);
            const string path = "/build/app2.js";

            // When
            string match = cache.MatchFile(path);

            // Then
            Assert.That(match, Is.Null);
        }

        [Test]
        public void BuildVersionCache_MatchesNoFile_FromUnknownExtensionPath()
        {
            // Given
            IBuildAssetVersionCache cache = GetSharedCacheObject(out _);
            const string path = "/build/app.css";

            // When
            string match = cache.MatchFile(path);

            // Then
            Assert.That(match, Is.Null);
        }

        [Test]
        public void BuildVersionCache_MatchesNoFile_NullArgument()
        {
            // Given
            IBuildAssetVersionCache cache = GetSharedCacheObject(out _);

            // When
            string match = cache.MatchFile(null);

            // Then
            Assert.That(match, Is.Null);
        }
        
        [Test]
        public void BuildVersionCache_MatchesHashFile_FromHashlessPath()
        {
            // Given
            IBuildAssetVersionCache cache = GetSharedCacheObject(out _);
            const string path = "/build/app.js";

            // When
            string match = cache.MatchFile(path);

            // Then
            Assert.That(match, Is.EqualTo("build/app.abcd.js"));
        }

        [Test]
        public void BuildVersionCache_MatchesLatestHashFile_FromHashlessPath()
        {
            // Given
            IBuildAssetVersionCache cache = GetSharedCacheObject(out TestFileStructure fileStructure);
            const string path = "/build/lib.js";

            SetFileWriteTime(fileStructure, "lib.abcd.js", DateTime.Now.AddHours(-2));
            SetFileWriteTime(fileStructure, "lib.efgh.js", DateTime.Now.AddHours(-1));
            SetFileWriteTime(fileStructure, "lib.hijk.js", DateTime.Now.AddHours(-3));

            // When
            string match = cache.MatchFile(path);

            // Then
            Assert.That(match, Is.EqualTo("build/lib.efgh.js"));
        }

        [Test]
        public void BuildVersionCache_MatchesLatestNonHashFile_FromHashlessPath() {
            // Given
            IBuildAssetVersionCache cache = GetSharedCacheObject(out TestFileStructure fileStructure);
            const string path = "/build/lib.js";

            SetFileWriteTime(fileStructure, "lib.abcd.js", DateTime.Now.AddHours(-2));
            SetFileWriteTime(fileStructure, "lib.efgh.js", DateTime.Now.AddHours(-1));
            SetFileWriteTime(fileStructure, "lib.js", DateTime.Now.AddHours(-0.5));
            SetFileWriteTime(fileStructure, "lib.hijk.js", DateTime.Now.AddHours(-3));

            // When
            string match = cache.MatchFile(path);

            // Then
            Assert.That(match, Is.EqualTo("build/lib.efgh.js"));
        }

        [Test]
        public void BuildVersionCache_MatchesDirectFile_FromExistingPath()
        {
            // Given
            IBuildAssetVersionCache cache = GetSharedCacheObject(out _);
            const string path = "/build/app.abcd.js";

            // When
            string match = cache.MatchFile(path);

            // Then
            Assert.That(match, Is.EqualTo("build/app.abcd.js"));
        }

        [Test]
        public void BuildVersionCache_MatchesLatestHashFile_FromNonMatchingHashPAth()
        {
            // Given
            IBuildAssetVersionCache cache = GetSharedCacheObject(out TestFileStructure fileStructure);
            const string path = "/build/lib.notexists.js";

            SetFileWriteTime(fileStructure, "lib.abcd.js", DateTime.Now.AddHours(-2));
            SetFileWriteTime(fileStructure, "lib.efgh.js", DateTime.Now.AddHours(-1));
            SetFileWriteTime(fileStructure, "lib.hijk.js", DateTime.Now.AddHours(-3));

            // When
            string match = cache.MatchFile(path);

            // Then
            Assert.That(match, Is.EqualTo("build/lib.efgh.js"));
        }

        private static void SetFileWriteTime(TestFileStructure structure, string file, DateTime lastWriteTime)
        {
            foreach (TestFileStructure child in structure.Children)
            {
                if (string.Equals(child.Name, file, StringComparison.OrdinalIgnoreCase))
                {
                    TestContext.Out.WriteLine($"Setting {child.FullName} write time to {lastWriteTime}");
                    File.SetLastWriteTime(child.FullName, lastWriteTime);
                    return;
                }
            }

            Assume.That(false, $"Unable to find {file} in {structure.FullName}");
        }

        private static IBuildAssetVersionCache GetSharedCacheObject(out TestFileStructure structure)
        {
            structure = new TestFileStructure("build")
            {
                Children =
                {
                    "app.abcd.js",
                    "lib.abcd.js",
                    "lib.efgh.js",
                    "lib.hijk.js"
                }
            };

            return new BuildAssetVersionCache(
                new FakeWebRootHostingEnvironment(
                    TestFileStructure.Create(structure)
                ),
                new NullLogger<BuildAssetVersionCache>()
            );
        }
    }
}