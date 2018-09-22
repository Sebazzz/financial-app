// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TestFileStructure.cs
//  Project         : App.Tests
// ******************************************************************************

using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.FileProviders.Physical;
using NUnit.Framework;

namespace App.Tests.TestSupport
{
    public sealed class TestFileStructure
    {
        public string Name { get; }
        public string FullName { get; private set; }
        public bool IsFile => this.Children.Count == 0;
        public List<TestFileStructure> Children { get; } = new List<TestFileStructure>();

        /// <inheritdoc />
        public TestFileStructure(string name)
        {
            this.Name = name;
        }

        public static IFileProvider Create(TestFileStructure structure)
        {
            string workingDirectory = TestContext.CurrentContext.TestDirectory;
            string testDirectory = DateTime.Now.ToFileTime().ToString("x2");

            void CreateFileSystemItem(DirectoryInfo currentDirectory, TestFileStructure currentNode)
            {
                if (currentNode.IsFile)
                {
                    File.WriteAllText(
                        currentNode.FullName = Path.Combine(currentDirectory.FullName, currentNode.Name),
                        currentNode.Name + "_" + DateTime.Now.ToString("O"));

                    TestContext.Out.WriteLine($"{nameof(TestFileStructure)}: File {currentNode.FullName}");
                }
                else
                {
                    currentDirectory = currentDirectory.CreateSubdirectory(currentNode.Name);
                    currentNode.FullName = currentDirectory.FullName;

                    TestContext.Out.WriteLine($"{nameof(TestFileStructure)}: Subdirectory {currentDirectory.FullName}");

                    foreach (TestFileStructure subNode in currentNode.Children)
                    {
                        CreateFileSystemItem(currentDirectory, subNode);
                    }
                }
            }

            DirectoryInfo directory = Directory.CreateDirectory(Path.Combine(workingDirectory, testDirectory));

            TestContext.Out.WriteLine($"{nameof(TestFileStructure)}: Using root path {directory.FullName}");

            CreateFileSystemItem(directory, structure);

            return new PhysicalFileProvider(directory.FullName, ExclusionFilters.None);
        }


        public static implicit operator TestFileStructure(string file)
        {
            return new TestFileStructure(file);
        }

    }
}