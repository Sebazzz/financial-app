namespace CodeGen.Templating {
    using System.Diagnostics;
    using Microsoft.AspNetCore.Mvc.Razor.Extensions;
    using Microsoft.AspNetCore.Razor.Language;
    using Microsoft.AspNetCore.Razor.Language.Intermediate;

    public class AssemblyAttributeInjectionPass : IntermediateNodePassBase, IRazorOptimizationPass
    {
        private const string RazorViewAttribute = "global::CodeGen.Templating.TemplateViewAttribute";

        protected override void ExecuteCore(RazorCodeDocument codeDocument, DocumentIntermediateNode documentNode)
        {
            var @namespace = documentNode.FindPrimaryNamespace();
            if (string.IsNullOrEmpty(@namespace?.Content))
            {
                // No namespace node or it's incomplete. Skip.
                return;
            }

            var @class = documentNode.FindPrimaryClass();
            if (string.IsNullOrEmpty(@class?.ClassName))
            {
                // No class node or it's incomplete. Skip.
                return;
            }

            var generatedTypeName = $"{@namespace.Content}.{@class.ClassName}";

            string attribute;
            if (documentNode.DocumentKind == MvcViewDocumentClassifierPass.MvcViewDocumentKind)
            {
                attribute = $"[assembly:{RazorViewAttribute}(typeof({generatedTypeName}))]";
            }
            else
            {
                return;
            }

            var index = documentNode.Children.IndexOf(@namespace);
            Debug.Assert(index >= 0);

            var pageAttribute = new CSharpCodeIntermediateNode();
            pageAttribute.Children.Add(new IntermediateToken()
            {
                Kind = TokenKind.CSharp,
                Content = attribute,
            });

            documentNode.Children.Insert(index, pageAttribute);
        }
        
    }
}