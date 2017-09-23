namespace App.Support.Setup {
    using Newtonsoft.Json.Linq;

    public sealed class SetupStepInvocation {
        public int SetupStepNumber { get; set; }

        public JToken Data { get; set; } 
    }
}