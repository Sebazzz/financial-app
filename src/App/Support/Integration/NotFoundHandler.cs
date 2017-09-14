// ******************************************************************************
//  © 2017 Ernst & Young - www.ey.com | www.beco.nl
// 
//  Author          : Ernst & Young - Cleantech and Sustainability
//  File:           : NotFoundHandler.cs
//  Project         : App
// ******************************************************************************

namespace App.Support.Integration {
    using System.Threading.Tasks;

    using Microsoft.AspNetCore.Http;

    public static class NotFoundHandler {
        public static Task Execute(HttpContext ctx) {
            HttpResponse response = ctx.Response;

            response.ContentType = "text/plain";
            response.StatusCode = 404;

            string errorMessage = $"Requested path {ctx.Request.Path} is not found on the server.";

            return response.WriteAsync(errorMessage, ctx.RequestAborted);
        }
    }
}
