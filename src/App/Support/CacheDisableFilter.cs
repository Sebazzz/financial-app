namespace App.Support {
    using System.Web.Http.Controllers;
    using System.Web.Http.Filters;

    public class CacheDisableFilter : ActionFilterAttribute {
        /// <summary>
        /// Occurs before the action method is invoked.
        /// </summary>
        /// <param name="actionContext">The action context.</param>
        public override void OnActionExecuting(HttpActionContext actionContext) {
            actionContext.Response.Headers.CacheControl.NoCache = true;
            actionContext.Response.Headers.CacheControl.NoStore = true;
        }
    }
}