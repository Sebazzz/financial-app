// ******************************************************************************
//  © 2017 Ernst & Young - www.ey.com | www.beco.nl
// 
//  Author          : Ernst & Young - Cleantech and Sustainability
//  File:           : NotFoundExtensions.cs
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
