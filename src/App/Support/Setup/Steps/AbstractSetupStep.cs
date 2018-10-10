// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AbstractSetupStep.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup.Steps {
    using System;
    using System.Threading.Tasks;

    public abstract class AbstractSetupStep {
        public abstract string Name { get; }

        internal abstract ValueTask<Boolean> HasBeenExecuted();

        internal abstract Task Execute(object data);

        /// <summary>
        /// Gets the type of data for the data parameter of the <see cref="Execute"/> method
        /// </summary>
        [CanBeNull]
        internal virtual Type DataType => null;
    }
}