// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : GenerateRepositoryAttribute.cs
//  Project         : App
// ******************************************************************************
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