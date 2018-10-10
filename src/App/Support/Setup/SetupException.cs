// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SetupException.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup {
    using System;
    using System.Runtime.Serialization;

    using Microsoft.AspNetCore.Mvc.ModelBinding;

    public class SetupException : Exception {
        public SetupException() { }
        public SetupException(string message) : base(message) { }
        public SetupException(string message, Exception innerException) : base(message, innerException) { }
        public SetupException(SerializationInfo info, StreamingContext context) : base(info, context) { }
    }

    public sealed class SetupValidationException : SetupException {
        public ModelStateDictionary ModelState { get; }

        public SetupValidationException(string message) : base(message) { }

        public SetupValidationException(ModelStateDictionary modelState) {
            this.ModelState = modelState;
        }
    }
}