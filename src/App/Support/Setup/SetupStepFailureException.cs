// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SetupStepFailureException.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup {
    using System;
    using System.Runtime.Serialization;

    public sealed class SetupStepFailureException : SetupException {
        public SetupStepFailureException() { }
        public SetupStepFailureException(string message) : base(message) { }
        public SetupStepFailureException(string message, Exception innerException) : base(message, innerException) { }
        public SetupStepFailureException(SerializationInfo info, StreamingContext context) : base(info, context) { }
    }
}