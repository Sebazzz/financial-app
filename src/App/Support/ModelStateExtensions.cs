namespace App.Support {
    using System;
    using System.Linq;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.AspNetCore.Mvc.ModelBinding;
    using Newtonsoft.Json.Serialization;

    /// <summary>
    /// Extensions for interop between model state and identity
    /// </summary>
    public static class ModelStateExtensions {
        public static void AppendIdentityResult(this ModelStateDictionary modelState, IdentityResult identityResult, Func<string, string> propertySelector=null) {
            foreach (IdentityError identityError in identityResult.Errors) {
                string code = identityError.Code;
                string propertyName = propertySelector?.Invoke(code);

                modelState.AddModelError(propertyName, identityError.Description);
            }
        }
    }
}
