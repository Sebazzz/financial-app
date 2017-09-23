// ******************************************************************************
//  © 2017 Ernst & Young - www.ey.com | www.beco.nl
// 
//  Author          : Ernst & Young - Cleantech and Sustainability
//  File:           : SetupAuthorizeFilter.cs
//  Project         : App
// ******************************************************************************

namespace App.Support.Filters {
    using System.Threading.Tasks;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.DependencyInjection;

    using Setup;

    public sealed class SetupAuthorizeAttribute : AuthorizeAttribute {
        public SetupAuthorizeAttribute() : base("AppSetup") { }
    }

    public sealed class SetupNotRunAuthorizationRequirement : IAuthorizationRequirement {}

    public sealed class SetupNotRunAuthorizationHandler : AuthorizationHandler<SetupNotRunAuthorizationRequirement> {
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, SetupNotRunAuthorizationRequirement requirement) {
            if (context.Resource is Microsoft.AspNetCore.Mvc.Filters.AuthorizationFilterContext mvcContext) {
                HttpContext httpContext = mvcContext.HttpContext;

                RequestAppSetupState appSetupState = httpContext.RequestServices.GetRequiredService<RequestAppSetupState>();

                if (!await appSetupState.HasBeenSetup()) {
                    context.Succeed(requirement);
                    return;
                }
            }
            
            context.Fail();
        }
    }
}
