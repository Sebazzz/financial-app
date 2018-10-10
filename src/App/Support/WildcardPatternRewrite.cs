// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : WildcardPatternRewrite.cs
//  Project         : App
// ******************************************************************************
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace App.Support
{
    public static class WildcardPatternRewrite
    {
        public static IApplicationBuilder AddWildcardPatternRewrite(this IApplicationBuilder app, PathString path)
        {
            return app.UseMiddleware<WildcardPatternRewriteMiddleware>(path);
        }


        internal sealed class WildcardPatternRewriteMiddleware
        {
            private readonly IBuildAssetVersionCache _buildAssetVersionCache;
            private readonly PathString _matchPath;
            private readonly RequestDelegate _next;

            /// <inheritdoc />
            public WildcardPatternRewriteMiddleware(IBuildAssetVersionCache buildAssetVersionCache, PathString matchPath, RequestDelegate next)
            {
                this._buildAssetVersionCache = buildAssetVersionCache;
                this._matchPath = matchPath;
                this._next = next;
            }

            public Task Invoke(HttpContext context)
            {
                HttpRequest request = context.Request;

                if (request.Path.StartsWithSegments(this._matchPath, StringComparison.OrdinalIgnoreCase))
                {
                    string newPath = this._buildAssetVersionCache.MatchFile(request.Path.Value);

                    if (!string.IsNullOrEmpty(newPath))
                    {
                        request.Path = new PathString("/" + newPath);
                    }
                }

                return this._next(context);
            }

        }
    }
}