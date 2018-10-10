// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : ModelStateCamelCaseFilter.cs
//  Project         : App
// ******************************************************************************
namespace App.Support {
    using System.Linq;

    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Filters;

    using Newtonsoft.Json.Serialization;

    /// <summary>
    /// Ensure returned model state is also in lowercase
    /// </summary>
    public class ModelStateCamelCaseFilter : ActionFilterAttribute {
        private readonly CamelCaseNamingStrategy _camelCase = new CamelCaseNamingStrategy {
            ProcessDictionaryKeys = true
        };

        public override void OnActionExecuted(ActionExecutedContext context) {
            if (context.Result is BadRequestObjectResult badRequest &&
                badRequest.Value is SerializableError modelError) {
                string[] keys = modelError.Keys.ToArray();

                foreach (string key in keys) {
                    string normalized = this._camelCase.GetDictionaryKey(key);

                    if (modelError.Remove(key, out object value)) {
                        modelError[normalized] = value;
                    }
                }
            }
        }
    }
}
