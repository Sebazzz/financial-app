// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : VersionedFileTagHelper.cs
//  Project         : App
// ******************************************************************************


namespace App.Support.Integration {
    using Microsoft.AspNetCore.Routing;

    public static class NotFoundExtensions {
        public static void MapFailedRoute(this IRouteBuilder routeBuilder, string template) {
            routeBuilder.MapRoute(template, NotFoundHandler.Execute);
        }
    }
}
