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
            // TODO: Enable once bugs in Entity Framework are resolved. This is caused by using lazy loading together with NoTracking.
            //  --> https://github.com/aspnet/EntityFrameworkCore/issues/10042
            //  --> https://github.com/aspnet/EntityFrameworkCore/issues/12780
            //DbContext dbContext = context.HttpContext.RequestServices.GetRequiredService<DbContext>();

            //dbContext.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
        }
    }
}
