namespace App.Support {
    using System;
    using Microsoft.AspNet.Http;

    public interface IBrowserDetector {
        bool IsMobileDevice();
    }

    public sealed class DefaultBrowserDetector : IBrowserDetector {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DefaultBrowserDetector(IHttpContextAccessor httpContextAccessor) {
            this._httpContextAccessor = httpContextAccessor;
        }

        public bool IsMobileDevice() {
            const string mobileDeviceUaPart = "Mobile";

            string userAgent = this._httpContextAccessor.HttpContext.Request.Headers["User-Agent"].ToString();

            return userAgent?.IndexOf(mobileDeviceUaPart, StringComparison.OrdinalIgnoreCase) != -1;
        }
    }
}