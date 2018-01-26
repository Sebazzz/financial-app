using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using App.Api;
using App.Support.Setup;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace App.Support.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class AllowDuringSetupAttribute : Attribute, IFilterMetadata {
    }

    public class SetupRequiredFilterAttribute : ActionFilterAttribute
    {
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (context.Filters.Any(x => x is AllowDuringSetupAttribute))
            {
                await base.OnActionExecutionAsync(context, next);
                return;
            }
            
            var setupState = GetSetupState(context);

            var hasBeenSetup = await setupState.HasBeenSetup();

            if (hasBeenSetup)
            {
                await base.OnActionExecutionAsync(context, next);
                return;
            }

            context.Result = new SetupRequiredResult();

            await base.OnActionExecutionAsync(context, next);
        }

        private RequestAppSetupState GetSetupState(ActionExecutingContext context)
        {
            return context.HttpContext.RequestServices.GetRequiredService<RequestAppSetupState>();
        }
    }
}