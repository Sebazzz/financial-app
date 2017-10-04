// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : VersionedFileTagHelper.cs
//  Project         : App
// ******************************************************************************


namespace App.Support.Filters {
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;

    public sealed class ReadOnlyApiAttribute : ActionFilterAttribute {
        public override void OnActionExecuting(ActionExecutingContext context) {
            DbContext dbContext = context.HttpContext.RequestServices.GetRequiredService<DbContext>();
            
            dbContext.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
        }
    }
}
