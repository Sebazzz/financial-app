namespace CodeGen.GenerateRepository {
    using System.Collections.Immutable;
    using System.Threading.Tasks;
    using CodeAnalysisExtensions;
    using Microsoft.CodeAnalysis;
    using Templating;

    internal sealed class CodeGen : AbstractCodeGen {
        public override async Task Execute(CodeGenContext context) {
            AttributeFinderVisitor finder = new AttributeFinderVisitor();
            context.Compilation.Assembly.Accept(finder);

            ConsoleWriter.Info($"Found {finder.Entities.Count} entities to generate repositories for");

            var template = TemplateFactory.GetTemplate(nameof(GenerateRepository) + ".Template.cshtml");
            template.SetModel(new GenerateRepositoryModel {
                Entities = finder.Entities
            });

            string result = await template.ExecuteAsync();

            ConsoleWriter.Success(result);
        }

        public override string ToString() {
            return "Generate Repositories";
        }
    }


    internal sealed class AttributeFinderVisitor : SymbolVisitor {
        public ImmutableList<INamedTypeSymbol> Entities { get; private set; } = ImmutableList<INamedTypeSymbol>.Empty;

        public override void VisitNamedType(INamedTypeSymbol symbol) {
            foreach (AttributeData attribute in symbol.GetAttributes()) {
                INamedTypeSymbol attrClass = attribute.AttributeClass;

                if (attrClass.ToFullyQualifiedName() == "App.Models.Domain.Repositories.GenerateRepositoryAttribute") {
                    ConsoleWriter.Verbose($"    [Visitor] Found entity {symbol.ToFullyQualifiedName()} with attribute {attrClass.ToFullyQualifiedName()}");

                    this.Entities = this.Entities.Add(symbol);
                }
            }
        }

        public override void VisitAssembly(IAssemblySymbol symbol) {
            ConsoleWriter.Verbose($"[Visitor] Visiting {symbol.ToFullyQualifiedName()}");

            symbol.GlobalNamespace.Accept(this);
        }

        public override void VisitNamespace(INamespaceSymbol symbol) {
            ConsoleWriter.Verbose($"[Visitor] Visiting {symbol.ToFullyQualifiedName()}");

            foreach (INamespaceOrTypeSymbol member in symbol.GetMembers()) {
                member.Accept(this);
            }
        }
    }
}