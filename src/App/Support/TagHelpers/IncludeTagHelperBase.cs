// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : IncludeTagHelperBase.cs
//  Project         : App
// ******************************************************************************
using System;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace App.Support.TagHelpers
{
    public abstract class IncludeTagHelperBase : TagHelper
    {
        protected string GetUrl(TagHelperContext context) {
            switch (context.TagName) {
                case "script":
                    return context.AllAttributes["src"]?.Value.ToString();

                case "link":
                    return context.AllAttributes["href"]?.Value.ToString();

                default:
                    throw new InvalidOperationException($"Unsupported tag {context.TagName}");
            }
        }

        protected void SetUrl(TagHelperOutput output, string url) {
            switch (output.TagName) {
                case "script":
                    output.Attributes.SetAttribute("src", url);
                    break;

                case "link":
                    output.Attributes.SetAttribute("href", url);
                    break;
            }
        }

        protected string MakeContentRelativePath(string input)
        {
            return input?.TrimStart('/');
        }
    }
}