namespace App.Api.Extensions {
    using System.Net;
    using System.Web.Http;

    internal static class ApiExtensions {
        /// <summary>
        ///     Throws an <see cref="HttpResponseException" /> when the input is <c>null</c>
        /// </summary>
        /// <remarks>
        ///     Probably from strict point of view a very bad idea, but it is so productive
        /// </remarks>
        /// <typeparam name="T"></typeparam>
        /// <param name="input"></param>
        /// <returns></returns>
        public static T EnsureNotNull<T>(this T input) where T : class {
            if (input == null) {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            return null;
        }
    }
}