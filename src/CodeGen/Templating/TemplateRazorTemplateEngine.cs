namespace CodeGen.Templating {
    using System.IO;
    using System.Text;
    using Microsoft.AspNetCore.Razor.Language;

    internal sealed class TemplateRazorTemplateEngine : RazorTemplateEngine {
        public TemplateRazorTemplateEngine(RazorEngine engine, RazorProject project) : base(engine, project) {
            this.Options.DefaultImports = GetDefaultImports();
        }

        private static RazorSourceDocument GetDefaultImports()
        {
            using (var stream = new MemoryStream()) {
                using (var writer = new StreamWriter(stream, Encoding.UTF8)) {
                    writer.WriteLine("@using System");
                    writer.WriteLine("@using System.Collections.Generic");
                    writer.WriteLine("@using System.Linq");
                    writer.WriteLine("@using System.Threading.Tasks");
                    writer.WriteLine("@using CodeGen.Templating.Runtime");
                    writer.Flush();

                    stream.Position = 0;
                    return RazorSourceDocument.ReadFrom(stream, fileName: null, encoding: Encoding.UTF8);
                }
            }
        }
    }
}