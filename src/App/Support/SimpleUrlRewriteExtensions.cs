// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SimpleUrlRewriteExtensions.cs
//  Project         : App
// ******************************************************************************
namespace App.Support {
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Http;

    public static class SimpleUrlRewriteExtensions {
        public static void UseSimpleUrlRemap(this IApplicationBuilder app, PathString incoming, PathString rewritten) =>
            app.Use((ctx, next) => {
                if (ctx.Request.Path.StartsWithSegments(new PathString(incoming))) {
                    ctx.Request.Path = new PathString(rewritten);
                }
                return next();
            });
    }
}
