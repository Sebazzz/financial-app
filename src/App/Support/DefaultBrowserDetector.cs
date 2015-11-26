namespace App.Support {
    using System;
    using Microsoft.AspNet.Http;

    public interface IBrowserDetector {
        bool IsMobileDevice(HttpContext httpContext);
    }

    public class DefaultBrowserDetector : IBrowserDetector {
        public bool IsMobileDevice(HttpContext httpContext) {
            const string mobileDeviceUaPart = "Mobile Safari";

            string userAgent = httpContext.Request.Headers["User-Agent"].ToString();

            return userAgent?.IndexOf(mobileDeviceUaPart, StringComparison.OrdinalIgnoreCase) != -1;
        }
    }
}