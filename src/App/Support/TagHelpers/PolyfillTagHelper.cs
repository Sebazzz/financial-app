// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : PolyfillTagHelper.cs
//  Project         : App
// ******************************************************************************
using System;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace App.Support.TagHelpers
{
    [HtmlTargetElement("script", Attributes = PolyfillTestAttribute)]
    public class ScriptPolyfillTagHelper : TagHelper {
        private const string PolyfillTestAttribute = "fa-polyfill-test";
        private const string HtmlSrcAttribute = "src";

        private readonly IFileVersionProvider _fileVersionProvider;
        public ScriptPolyfillTagHelper(IFileVersionProvider fileVersionProvider)
        {
            this._fileVersionProvider = fileVersionProvider;
        }

        [HtmlAttributeNotBound]
        [ViewContext]
        public ViewContext ViewContext { get; set; }

        [HtmlAttributeName(PolyfillTestAttribute)]
        public string PolyfillTest { get; set; }

        [HtmlAttributeName(HtmlSrcAttribute)]
        public string Src { get; set; }

        /// <inheritdoc />
        public override void Process([App.NotNull] TagHelperContext context, [App.NotNull] TagHelperOutput output)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            if (output == null) throw new ArgumentNullException(nameof(output));

            // Pass through attribute that is also a well-known HTML attribute
            if (this.Src != null)
            {
                output.CopyHtmlAttribute(HtmlSrcAttribute, context);
            }

            // Retrieve the TagHelperOutput variation of the "src" attribute in case other TagHelpers in the
            // pipeline have touched the value. If the value is already encoded this ScriptTagHelper may
            // not function properly.
            TagHelperAttribute srcAttribute = output.Attributes[HtmlSrcAttribute];
            this.Src = srcAttribute?.Value as string;

            if (srcAttribute == null)
            {
                return;
            }

            // Output path in polyfill detection code with version string
            output.Attributes.Remove(srcAttribute);

            string path = this._fileVersionProvider.AddFileVersionToPath(this.ViewContext.HttpContext.Request.PathBase, this.Src);
            output.Content.SetHtmlContent(
                $"{this.PolyfillTest}||pf('{JavaScriptEncoder.Default.Encode(path)}')"
            );
        }

        // We need this tag helper to execute as last
        public override int Order => 1000;
    }

    [HtmlTargetElement("link", Attributes = PolyfillTestAttribute)]
    public class LinkPolyfillTagHelper : TagHelper {
        private const string PolyfillTestAttribute = "fa-polyfill-test";
        private const string HtmlHrefAttribute = "href";

        private readonly IFileVersionProvider  _fileVersionProvider;
        public LinkPolyfillTagHelper(IFileVersionProvider fileVersionProvider)
        {
            this._fileVersionProvider = fileVersionProvider;
        }

        [HtmlAttributeNotBound]
        [ViewContext]
        public ViewContext ViewContext { get; set; }

        [HtmlAttributeName(PolyfillTestAttribute)]
        public string PolyfillTest { get; set; }

        [HtmlAttributeName(HtmlHrefAttribute)]
        public string Href { get; set; }

        /// <inheritdoc />
        public override void Process([App.NotNull] TagHelperContext context, [App.NotNull] TagHelperOutput output) {
            if (context == null) throw new ArgumentNullException(nameof(context));
            if (output == null) throw new ArgumentNullException(nameof(output));

            // Pass through attribute that is also a well-known HTML attribute
            if (this.Href != null) {
                output.CopyHtmlAttribute(HtmlHrefAttribute, context);
            }

            // Retrieve the TagHelperOutput variation of the "href" attribute in case other TagHelpers in the
            // pipeline have touched the value. If the value is already encoded this TagHelper may
            // not function properly.
            TagHelperAttribute hrefAttribute = output.Attributes[HtmlHrefAttribute];
            this.Href = hrefAttribute?.Value as string;

            if (hrefAttribute == null) {
                return;
            }

            // Output path in polyfill detection code with version string
            output.Attributes.Remove(hrefAttribute);
            output.Attributes.RemoveAll("rel");

            string path = this._fileVersionProvider.AddFileVersionToPath(this.ViewContext.HttpContext.Request.PathBase, this.Href);
            output.TagName = "script";
            output.TagMode = TagMode.StartTagAndEndTag;
            output.Content.SetHtmlContent(
                $"{this.PolyfillTest}||ss('{JavaScriptEncoder.Default.Encode(path)}')"
            );
        }

        // We need this tag helper to execute as last
        public override int Order => 1000;
    }
}
