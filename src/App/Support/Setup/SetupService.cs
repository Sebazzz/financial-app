// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SetupService.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Setup {
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    using Microsoft.Extensions.Logging;

    using Steps;

    public delegate bool ObjectValidationCallback(object data);

    public sealed class SetupService {
        private readonly Lazy<AbstractSetupStep[]> _setupSteps;
        private readonly ILogger<SetupService> _logger;

        public SetupService(SetupStepFactory setupStepFactory, ILogger<SetupService> logger) {
            this._logger = logger;

            this._setupSteps = new Lazy<AbstractSetupStep[]>(setupStepFactory.GetSteps, LazyThreadSafetyMode.None);
        }

        public IEnumerable<SetupStepDescriptor> GetSteps() {
            for (int i = 0; i < this._setupSteps.Value.Length; i++) {

                yield return this.CreateDescriptor(i);
            }
        }

        private SetupStepDescriptor CreateDescriptor(int index) {
            bool isDoneStep = index + 1 == this._setupSteps.Value.Length;

            return new SetupStepDescriptor {
                Order = index,
                IsDone = isDoneStep,
                Name = this._setupSteps.Value[index].Name
            };
        }

        public async Task<SetupStepDescriptor> DetermineCurrentStep() {
            AbstractSetupStep initialSetupStep = null;
            const int firstRealSetupIndex = 2;

            for (int i = 0; i < this._setupSteps.Value.Length; i++) {
                AbstractSetupStep current = this._setupSteps.Value[i];

                bool hasBeenExecuted = await current.HasBeenExecuted();
                if (hasBeenExecuted) {
                    continue;
                }

                if (i < firstRealSetupIndex) {
                    initialSetupStep = initialSetupStep ?? current;
                } else {
                    this._logger.LogInformation("Determine current step: Step #{0} ('{1}') has been determined that is has not been executed", i, current.Name);

                    if (i > 1 && initialSetupStep != null && !(current is DoneSetupStep)) {
                        return this.CreateDescriptor(Array.IndexOf(this._setupSteps.Value, initialSetupStep));
                    }

                    return this.CreateDescriptor(i);
                }

                this._logger.LogInformation("Determine current step: Step #{0} ('{1}') has been determined that is has executed", i, current.Name);
            }

            return this.CreateDescriptor(this._setupSteps.Value.Length - 1);
        }

        public async Task<SetupStepDescriptor> ExecuteStep(SetupStepInvocation invocation, ObjectValidationCallback validationCallback) {
            SetupStepDescriptor currentStep = await this.DetermineCurrentStep();
            if (currentStep.Order > 0 && currentStep.Order != invocation.SetupStepNumber) {
                this._logger.LogWarning(
                    "User attempted to execute setup step #{0} but the current step should be {1}", invocation.SetupStepNumber, currentStep.Order);

                throw new SetupWizardOutOfSyncException("Set-up kan niet worden voorgezet. Herlaad de pagina en probeer het opnieuw.");
            }

            this._logger.LogInformation("Executing setup step #{0}", invocation.SetupStepNumber);

            try {
                await this.ExecuteStepInternal(invocation, validationCallback);
            }
            catch (Exception ex) when (!(ex is SetupException)) {
                this._logger.LogError(
                    ex,
                    "Unable to execute setup step #{0} ('{1}'): {2}",
                    currentStep.Order,
                    currentStep.Name,
                    ex.Message
                );

                throw new SetupStepFailureException($"Set-up stap '{currentStep.Name}' kan niet worden uitgevoerd.", ex);
            }

            if (currentStep.IsDone) {
                return null;
            }

            return await this.DetermineCurrentStep();
        }

        private Task ExecuteStepInternal(SetupStepInvocation invocation, ObjectValidationCallback validationCallback) {
            AbstractSetupStep step = this._setupSteps.Value[invocation.SetupStepNumber];

            object data = DeserializeData(invocation, validationCallback, step.DataType);

            return step.Execute(data);
        }

        private static object DeserializeData(SetupStepInvocation invocation, ObjectValidationCallback validationCallback, Type dataType) {
            object data = null;
            if (dataType != null) {
                if (invocation.Data == null) {
                    throw new InvalidOperationException("Data parameter is null");
                }

                data = invocation.Data.ToObject(dataType);
                if (!validationCallback.Invoke(data)) {
                    throw new SetupValidationException($"Unable to validate data of type {dataType}");
                }
            }
            return data;
        }
    }
}
