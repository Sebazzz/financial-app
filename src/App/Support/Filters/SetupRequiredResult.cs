// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SetupRequiredResult.cs
//  Project         : App
// ******************************************************************************
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace App.Support.Filters
{
    public class SetupRequiredResult: IActionResult
    {
        public Task ExecuteResultAsync(ActionContext context)
        {
            var response = context.HttpContext.Response;

            response.StatusCode = (int) HttpStatusCode.ServiceUnavailable;
            response.Headers.Add("X-Reason", "Setup");

            return Task.CompletedTask;
        }
    }
}
