// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SetupWizardOutOfSyncException.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup {
    public sealed class SetupWizardOutOfSyncException : SetupException {
        public SetupWizardOutOfSyncException(string message) : base(message) { }
    }
}