namespace App.Api.Extensions {
    using System;
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using System.Web.Http;

    using Microsoft.AspNetCore.Mvc;

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
        public static async Task<T> EnsureNotNull<T>([NotNull] this Task<T> input, HttpStatusCode throwCode = HttpStatusCode.NotFound) where T : class {
            if (input == null) throw new ArgumentNullException(nameof(input));

            T result = await input;

            if (result == null) {
                throw new HttpResponseException(throwCode);
            }

            return result;
        }
    }
}