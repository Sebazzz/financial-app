// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : VersionedFileTagHelper.cs
//  Project         : App
// ******************************************************************************


namespace App.Support.TagHelpers {
    using System;

    using Microsoft.AspNetCore.Razor.TagHelpers;

    [HtmlTargetElement("script", Attributes = UrlAttribute)]
    [HtmlTargetElement("link", Attributes = UrlAttribute)]
    public sealed class IncludeTagHelper : TagHelper {
        private const string UrlAttribute = "fa-url";

        private readonly IStaticFileUrlGenerator _staticFileUrlGenerator;

        public IncludeTagHelper(IStaticFileUrlGenerator staticFileUrlGenerator) {
            this._staticFileUrlGenerator = staticFileUrlGenerator;
        }

        [HtmlAttributeName(UrlAttribute)]
        public string Url { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output) {
            if (!String.IsNullOrEmpty(this.Url)) {

                string url = this._staticFileUrlGenerator.GenerateUrl(this.Url);

                switch (output.TagName) {
                    case "script":
                        output.Attributes.SetAttribute("src", url);
                        break;

                    case "link":
                        output.Attributes.SetAttribute("href", url);
                        break;
                }
            }
        }
    }
}
