// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DoneSetupStep.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup.Steps {
    using System;
    using System.Threading.Tasks;

    public sealed class DoneSetupStep : AbstractSetupStep {
        public override string Name => "Installatie voltooid";

        internal override ValueTask<Boolean> HasBeenExecuted() {
            return new ValueTask<bool>(false);
        }

        internal override Task Execute(object data) {
            return Task.CompletedTask;
        }
    }
}