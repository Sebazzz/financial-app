namespace CodeGen.Templating {
    using System;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Text;
    using Microsoft.AspNetCore.Mvc.Razor.Extensions;
    using Microsoft.AspNetCore.Mvc.Razor.Internal;
    using Microsoft.AspNetCore.Razor.Language;
    using Microsoft.AspNetCore.Razor.Language.Extensions;
    using Microsoft.CodeAnalysis;
    using Microsoft.CodeAnalysis.CSharp;
    using Microsoft.CodeAnalysis.Emit;
    using Microsoft.CodeAnalysis.Text;
    using Runtime;

    public sealed class TemplateFactory {
        public static Template GetTemplate(string path) {
            var engine = RazorEngine.Create(b => {
                b.SetNamespace("CodeGen.Templates.Generated");
                b.SetBaseType(typeof(TemplateView).FullName);

                ModelDirective.Register(b);
                InheritsDirective.Register(b);
                FunctionsDirective.Register(b);

                b.Features.Add(new TemplateViewDocumentClassifierPass());
                b.Features.Add(new AssemblyAttributeInjectionPass());
            });

            var assembly = Assembly.GetExecutingAssembly();

            var fullPath = nameof(CodeGen) + "." + path;
            var stream = assembly.GetManifestResourceStream(fullPath);

            if (stream == null) throw new InvalidOperationException("Invalid path: " + path);

            ConsoleWriter.Verbose($"Razor: parsing {path}");

            var sourceDocument = RazorSourceDocument.ReadFrom(stream, path);
            var codeDocument = RazorCodeDocument.Create(sourceDocument);
            RazorTemplateEngine templateEngine =
                new TemplateRazorTemplateEngine(engine, RazorProject.Create(Path.GetFullPath("../..")));

            var code = templateEngine.GenerateCode(codeDocument);

            if (code.Diagnostics.Count > 0) {
                foreach (var codeDiagnostic in code.Diagnostics) ConsoleWriter.Error(codeDiagnostic.ToString());

                throw new InvalidOperationException("Razor compilation error");
            }

            var csharpCode = code.GeneratedCode;
            var assemblyName = Path.GetRandomFileName();

            ConsoleWriter.Verbose($"Compiling parsed Razor code from {path}");

            var compilation = CreateCompilation(csharpCode, assemblyName);
            var compiledAssembly = Compile(compilation);

            ConsoleWriter.Verbose($"  ... loaded assembly {compiledAssembly}");

            var templateClass = InitTemplateClass(compiledAssembly);

            ConsoleWriter.Verbose($"Return template instance from path {path}");

            return new Template(templateClass);
        }

        private static TemplateView InitTemplateClass(Assembly compiledAssembly) {
            var templateType = FindTemplateClass(compiledAssembly);
            if (Activator.CreateInstance(templateType) is TemplateView templateView) return templateView;

            throw new InvalidOperationException(
                $"Unable to activate template view type in compiled assembly: {compiledAssembly}");
        }

        private static Type FindTemplateClass(Assembly compiledAssembly) {
            var templateViewAttribute = compiledAssembly.GetCustomAttribute<TemplateViewAttribute>();

            if (templateViewAttribute == null)
                throw new InvalidOperationException(
                    $"Unable to find template reference in compiled assembly: {compiledAssembly}");

            if (templateViewAttribute.ViewType == null)
                throw new InvalidOperationException(
                    $"Unable to find template view type in compiled assembly: {compiledAssembly}");

            var templateType = templateViewAttribute.ViewType;
            return templateType;
        }

        private static Assembly Compile(CSharpCompilation compilation) {
            using (var assemblyStream = new MemoryStream())
            using (var pdbStream = new MemoryStream()) {
                var result = compilation.Emit(
                    assemblyStream,
                    pdbStream,
                    options: new EmitOptions(false, DebugInformationFormat.PortablePdb));

                if (!result.Success) {
                    foreach (var diagnostic in result.Diagnostics) ConsoleWriter.Error(diagnostic.ToString());

                    throw new InvalidOperationException("Razor -> CSharp compilation error");
                }

                assemblyStream.Seek(0, SeekOrigin.Begin);
                pdbStream.Seek(0, SeekOrigin.Begin);

                var assembly = Assembly.Load(assemblyStream.ToArray(), pdbStream.ToArray());
                ConsoleWriter.Verbose($"  ... done: compilation");

                return assembly;
            }
        }


        private static CSharpCompilation CreateCompilation(string compilationContent, string assemblyName) {
            MetadataReference GetReferenceFromAssemby(Assembly assembly) {
                return MetadataReference.CreateFromFile(assembly.Location, MetadataReferenceProperties.Assembly);
            }

            var sourceText = SourceText.From(compilationContent, Encoding.UTF8);
            var syntaxTree = CSharpSyntaxTree.ParseText(sourceText, CSharpParseOptions.Default)
                .WithFilePath(assemblyName);
            var compilation =
                CSharpCompilation.Create(assemblyName)
                    .WithOptions(new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary))
                    .AddSyntaxTrees(syntaxTree)
                    .AddReferences(AppDomain.CurrentDomain.GetAssemblies().Where(x => !x.IsDynamic)
                        .Select(GetReferenceFromAssemby));

            compilation = ExpressionRewriter.Rewrite(compilation);

            return compilation;
        }
    }
}