namespace App.Support {
    using System;
    using Microsoft.AspNetCore.Http;

    public interface IBrowserDetector {
        bool IsMobileDevice();
    }

    /// <summary>
    /// Temporary polyfill class for mobile device detection. Unfortunately .NET core doesn't have such detection, while MVC5 did.
    /// </summary>
    public sealed class DefaultBrowserDetector : IBrowserDetector {
        private static readonly string[] MobileDetectionStrings = {
            "Windows Phone",
            "Android",
            "Mobile",
            "IEMobile"  
        };

        private readonly IHttpContextAccessor _httpContextAccessor;

        public DefaultBrowserDetector(IHttpContextAccessor httpContextAccessor) {
            this._httpContextAccessor = httpContextAccessor;
        }

        public bool IsMobileDevice() {
            string userAgent = String.Join(" ", this._httpContextAccessor.HttpContext.Request.Headers["User-Agent"]);
            if (userAgent == null) {
                return false;
            }

            foreach (string detectionString in MobileDetectionStrings) {
                if (userAgent.IndexOf(detectionString, StringComparison.OrdinalIgnoreCase) != -1) {
                    return true;
                }
            }

            return false;
        }
    }
}