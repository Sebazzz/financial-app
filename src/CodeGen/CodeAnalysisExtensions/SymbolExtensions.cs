namespace CodeGen.CodeAnalysisExtensions {
    using Microsoft.CodeAnalysis;

    public static class SymbolExtensions {
        public static string ToFullyQualifiedName(this ISymbol symbol) {
            var parts = symbol.ToDisplayParts(SymbolDisplayFormat.FullyQualifiedFormat);

            while (parts[0].Kind == SymbolDisplayPartKind.Punctuation || parts[0].ToString() == "global") {
                parts = parts.RemoveAt(0);
            }

            return parts.ToDisplayString();
        }
    }
}