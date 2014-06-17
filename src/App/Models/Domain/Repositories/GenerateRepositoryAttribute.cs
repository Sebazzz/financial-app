namespace App.Models.Domain.Repositories {
    using System;

    [AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = false)]
    internal sealed class GenerateRepositoryAttribute : Attribute {}


    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = false)]
    internal sealed class GenerateRepositoryQueryAttribute : Attribute {
        public string SuggestedName { get; set; }
        public bool IsMultiple { get; set; }
    }
}