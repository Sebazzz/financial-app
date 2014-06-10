namespace AngularJSTest.Controllers {
    using System;
    using System.Web.Mvc;
    using System.Web.Routing;

    public class CatchAllControllerFactory : DefaultControllerFactory {
        /// <summary>
        /// Retrieves the controller type for the specified name and request context.
        /// </summary>
        /// <returns>
        /// The controller type.
        /// </returns>
        /// <param name="requestContext">The context of the HTTP request, which includes the HTTP context and route data.</param><param name="controllerName">The name of the controller.</param>
        protected override Type GetControllerType(RequestContext requestContext, string controllerName) {
            return base.GetControllerType(requestContext, controllerName) ?? typeof(HomeController) /* Catch-all */;
        }
    }
}