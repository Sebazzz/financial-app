// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SetupRequiredFilterAttribute.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Filters {
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Extensions.DependencyInjection;
    using Setup;

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AllowDuringSetupAttribute : Attribute, IFilterMetadata { }

    public class SetupRequiredFilterAttribute : ActionFilterAttribute {
        public override async Task
            OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next) {
            if (context.Filters.Any(x => x is AllowDuringSetupAttribute)) {
                await base.OnActionExecutionAsync(context, next);
                return;
            }

            var setupState = this.GetSetupState(context);

            var hasBeenSetup = await setupState.HasBeenSetup();

            if (hasBeenSetup) {
                await base.OnActionExecutionAsync(context, next);
                return;
            }

            context.Result = new SetupRequiredResult();

            await base.OnActionExecutionAsync(context, next);
        }

        private RequestAppSetupState GetSetupState(ActionExecutingContext context) {
            return context.HttpContext.RequestServices.GetRequiredService<RequestAppSetupState>();
        }
    }
}