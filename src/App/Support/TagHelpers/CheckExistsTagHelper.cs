using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace App.Support.TagHelpers
{
    [HtmlTargetElement("script", Attributes = CheckExistsAttribute)]
    [HtmlTargetElement("link", Attributes = CheckExistsAttribute)]
    public class CheckExistsTagHelper : IncludeTagHelperBase {
        private const string CheckExistsAttribute = "fa-check-exists";

        private readonly IHostingEnvironment _hostingEnvironment;

        public CheckExistsTagHelper(IHostingEnvironment hostingEnvironment) {
            _hostingEnvironment = hostingEnvironment;
        }

        [HtmlAttributeName(CheckExistsAttribute)]
        public bool CheckExists { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            if (!this.CheckExists)
            {
                return;
            }

            string relativeSrc = MakeContentRelativePath(GetUrl(context));
            bool exists = this._hostingEnvironment.WebRootFileProvider.GetFileInfo(relativeSrc).Exists;

            if (!exists)
            {
                output.SuppressOutput();
            }
        }
    }
}