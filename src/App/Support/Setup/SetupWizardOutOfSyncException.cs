namespace App.Support.Setup {
    public sealed class SetupWizardOutOfSyncException : SetupException {
        public SetupWizardOutOfSyncException(string message) : base(message) { }
    }
}