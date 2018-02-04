namespace CodeGen {
    using System.IO;
    using System.Threading;
    using Microsoft.CodeAnalysis.CSharp;

    internal sealed class CodeGenContext {
        public CSharpCompilation Compilation {get;}

        public CancellationToken CancellationToken { get; }

        public DirectoryInfo ProjectDirectory { get; }

        public CodeGenContext(CancellationToken cancellationToken, CSharpCompilation compilation, DirectoryInfo projectDirectory) {
            this.CancellationToken = cancellationToken;
            this.Compilation = compilation;
            this.ProjectDirectory = projectDirectory;
        }
    }
}