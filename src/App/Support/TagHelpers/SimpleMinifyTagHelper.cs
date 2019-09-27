// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SimpleMinifyTagHelper.cs
//  Project         : App
// ******************************************************************************
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace App.Support.TagHelpers
{
    [HtmlTargetElement("script", Attributes = MinifyAttributeName)]
    public class SimpleMinifyTagHelper : TagHelper
    {
        private const string MinifyAttributeName = "fa-minify";

        [HtmlAttributeName(MinifyAttributeName)]
        public object Nop { get; set; }

        /// <inheritdoc />
        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            TagHelperContent content = await output.GetChildContentAsync();

            var str = new StringBuilder(content.GetContent()?.Trim());
            str.Replace("\n", string.Empty);
            str.Replace("\r", string.Empty);

            int currentLength;
            do
            {
                currentLength = str.Length;
                str.Replace("  ", " ");
            } while (currentLength != str.Length);

            content.SetHtmlContent(str.ToString());

            output.Content = content;
        }
    }
}