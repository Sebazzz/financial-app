namespace CodeGen {
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Threading;
    using System.Threading.Tasks;
    using Buildalyzer;
    using Buildalyzer.Workspaces;
    using Microsoft.Build.Framework;
    using Microsoft.CodeAnalysis;
    using Microsoft.CodeAnalysis.CSharp;
    using Microsoft.CodeAnalysis.Text;

    internal class Program {
        private static void Main() {
            MainCore().GetAwaiter().GetResult();
        }

        private static async Task MainCore() {
            ConsoleWriter.Clear();
            ConsoleWriter.Info("Financial App codegen");

            FileInfo projectFile = FindProjectFile();
            CSharpCompilation compilation = await CreateCompilation(projectFile);

            IEnumerable<AbstractCodeGen> codeGenerators = GetCodeGen(Assembly.GetExecutingAssembly());

            CodeGenContext context = new CodeGenContext(CancellationToken.None, compilation, projectFile.Directory);
            foreach (var codeGenerator in codeGenerators) {
                ConsoleWriter.Info($"Executing code generator: {codeGenerator}");

                try {
                    await codeGenerator.Execute(context);

                    ConsoleWriter.Success($"... Success executing {codeGenerator}");
                }
                finally {
                    if (codeGenerator is IDisposable dispose) dispose?.Dispose();
                }
            }

            ConsoleWriter.Success("Code generation complete");
        }

        private static IEnumerable<AbstractCodeGen> GetCodeGen(Assembly assembly) {
            ConsoleWriter.Verbose($"Finding AbstractCodeGen implementations in {assembly}");

            foreach (Type type in assembly.GetTypes().Where(x => !x.IsAbstract && typeof(AbstractCodeGen).IsAssignableFrom(x))) {
                ConsoleWriter.Verbose($"... {type}");

                yield return (AbstractCodeGen) Activator.CreateInstance(type);
            }
        }

        private static async Task<CSharpCompilation> CreateCompilation(FileInfo projectFile) {
            ConsoleWriter.Info($"Creating compilation of {projectFile}");

            AnalyzerManager manager = new AnalyzerManager(ConsoleWriter.VerboseWriter());
            ProjectAnalyzer projectManager = manager.GetProject(projectFile.FullName);

            AdhocWorkspace workspace = new AdhocWorkspace();
            Project project = projectManager.AddToWorkspace(workspace, true);

            Compilation compilation = await project.GetCompilationAsync();

            ConsoleWriter.Info($"Created compilation of {projectFile}");

            return (CSharpCompilation) compilation; 
        }

    

        private static FileInfo FindProjectFile() {
            DirectoryInfo directory = new DirectoryInfo(Directory.GetCurrentDirectory());

            ConsoleWriter.Verbose($"Finding project directory, starting in {directory.FullName}");

            while (directory != null && !String.Equals(directory.Name, "src")) {
                directory = directory.Parent;
            }

            if (directory == null) {
                throw new InvalidOperationException($"Unable to find project directory - starting with {Directory.GetCurrentDirectory()}");
            }

            ConsoleWriter.Verbose($"... found sources directory {directory.Name}, finding project dir...");

            DirectoryInfo projectDirectory = directory.GetDirectories("App").FirstOrDefault();

            if (projectDirectory == null) {
                throw new InvalidOperationException($"Unable to find project directory in src directory {directory}");
            }

            ConsoleWriter.Verbose($"Found project directory {projectDirectory}");

            FileInfo projectFile = projectDirectory.GetFiles(projectDirectory.Name + ".csproj").FirstOrDefault();

            if (projectFile == null) {
                throw new InvalidOperationException($"Unable to find project file in src directory {projectDirectory}");
            }
            
            ConsoleWriter.Info($"Using project file {projectFile}");

            return projectFile;
        }
    }
}