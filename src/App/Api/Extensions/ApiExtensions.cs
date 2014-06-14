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
        /// <param name="throwCode"></param>
        /// <returns></returns>
        [NotNull]
        public static T EnsureNotNull<T>([CanBeNull]this T input, HttpStatusCode throwCode = HttpStatusCode.NotFound) where T : class {
            if (input == null) {
                throw new HttpResponseException(throwCode);
            }

            return input;
        }
    }
}