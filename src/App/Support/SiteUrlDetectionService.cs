// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SiteUrlDetectionService.cs
//  Project         : App
// ******************************************************************************
namespace App.Support {
    using System;
    using System.Threading.Tasks;
    using Microsoft.ApplicationInsights.AspNetCore.Extensions;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;

    public interface ISiteUrlDetectionService {
        void Update(HttpContext httpContext);
        string GetSiteUrl();
    }

    public class SiteUrlDetectionService : ISiteUrlDetectionService {
        private readonly ILogger<SiteUrlDetectionService> _logger;
        private string _siteUrl;

        public SiteUrlDetectionService(IOptions<ServerOptions> serverOptions, ILogger<SiteUrlDetectionService> logger) {
            this._logger = logger;
            this._siteUrl = serverOptions.Value?.BaseUrl;

            if (String.IsNullOrEmpty(this._siteUrl)) {
                this._siteUrl = null;
            }
            else
            {
                try
                {
                    this._siteUrl = new Uri(this._siteUrl, UriKind.Absolute).GetLeftPart(UriPartial.Authority);

                    this._logger.LogInformation("Normalized base URL: {0}", this._siteUrl);
                } catch (Exception ex)
                {
                    this._logger.LogError(ex, "Unable to normalize base url");
                }
            }
        }


        public void Update(HttpContext httpContext) {
            if (this._siteUrl == null) {
                this._logger.LogWarning("You have not set an explicit base URL of the application via the [Server:BaseUrl] option. The base URL is now automatically detected. This detection is possibly insecure, and can lead to incorrect results.");

                HttpRequest request = httpContext.Request;
                this._siteUrl = request.GetUri().GetLeftPart(UriPartial.Authority);

                this._logger.LogInformation("Detected base URL: {0}", this._siteUrl);
            }
        }

        public string GetSiteUrl() {
            return this._siteUrl;
        }


        public sealed class Middleware {
            private readonly ISiteUrlDetectionService _siteUrlDetectionService;
            private readonly RequestDelegate _next;

            public Middleware(ISiteUrlDetectionService siteUrlDetectionService, RequestDelegate next) {
                this._siteUrlDetectionService = siteUrlDetectionService;
                this._next = next;
            }

            public Task Invoke(HttpContext context) {
                this._siteUrlDetectionService.Update(context);

                return this._next.Invoke(context);
            }
        }
    }
}