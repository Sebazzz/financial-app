namespace CodeGen.GenerateRepository {
    using System.Collections.Immutable;
    using Microsoft.CodeAnalysis;

    public sealed class GenerateRepositoryModel {
        public ImmutableList<INamedTypeSymbol> Entities { get; set; }


    }
}