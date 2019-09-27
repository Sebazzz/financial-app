// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : ModelStateExtensions.cs
//  Project         : App
// ******************************************************************************
using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace App.Support
{
    using System.Collections.Generic;

    /// <summary>
    ///     Extensions for interop between model state and identity
    /// </summary>
    public static class ModelStateExtensions
    {
        public static void AppendIdentityResult(this ModelStateDictionary modelState, IdentityResult identityResult,
                                                Func<string, string> propertySelector = null)
        {
            var uniqueErrors = new HashSet<string>();

            foreach (IdentityError identityError in identityResult.Errors)
            {
                string code = identityError.Code;

                if (!uniqueErrors.Add(code)) {
                    continue;
                }
                
                string propertyName = propertySelector?.Invoke(code);

                modelState.AddModelError(propertyName, identityError.Description);
            }
        }
    }
}