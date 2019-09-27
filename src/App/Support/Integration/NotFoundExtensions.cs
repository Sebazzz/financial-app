// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : NotFoundExtensions.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Integration {
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Routing;

    public static class NotFoundExtensions {
        public static void MapFailedRoute(this IEndpointRouteBuilder routeBuilder, string template) => routeBuilder.Map(template, NotFoundHandler.Execute);
    }
}
