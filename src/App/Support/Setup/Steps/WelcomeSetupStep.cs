// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : WelcomeSetupStep.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup.Steps {
    using System;
    using System.Threading.Tasks;

    public sealed class WelcomeSetupStep : AbstractSetupStep {
        private static bool _IsDone;
        public override string Name => "Welkom";

        internal override ValueTask<Boolean> HasBeenExecuted() {
            return new ValueTask<bool>(_IsDone);
        }

        internal override Task Execute(object data) {
            _IsDone = true;
            return Task.CompletedTask;
        }
    }
}