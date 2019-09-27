// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : CheckExistsTagHelper.cs
//  Project         : App
// ******************************************************************************
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace App.Support.TagHelpers
{
    [HtmlTargetElement("script", Attributes = CheckExistsAttribute)]
    [HtmlTargetElement("link", Attributes = CheckExistsAttribute)]
    public class CheckExistsTagHelper : IncludeTagHelperBase {
        private const string CheckExistsAttribute = "fa-check-exists";

        private readonly IWebHostEnvironment _hostingEnvironment;

        public CheckExistsTagHelper(IWebHostEnvironment hostingEnvironment) {
            this._hostingEnvironment = hostingEnvironment;
        }

        [HtmlAttributeName(CheckExistsAttribute)]
        public bool CheckExists { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            if (!this.CheckExists)
            {
                return;
            }

            string relativeSrc = this.MakeContentRelativePath(this.GetUrl(context));
            bool exists = this._hostingEnvironment.WebRootFileProvider.GetFileInfo(relativeSrc).Exists;

            if (!exists)
            {
                output.SuppressOutput();
            }
        }
    }
}