// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : PolyfillTagHelper.cs
//  Project         : App
// ******************************************************************************
using System;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.AspNetCore.Mvc.TagHelpers.Internal;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.Caching.Memory;

namespace App.Support.TagHelpers
{
    [HtmlTargetElement("script", Attributes = PolyfillTestAttribute)]
    public class ScriptPolyfillTagHelper : TagHelper {
        private const string PolyfillTestAttribute = "fa-polyfill-test";
        private const string HtmlSrcAttribute = "src";

        private FileVersionProvider _fileVersionProvider;
        private readonly IMemoryCache _cache;
        private readonly IHostingEnvironment _hostingEnvironment;
        public ScriptPolyfillTagHelper(IHostingEnvironment hostingEnvironment, IMemoryCache cache)
        {
            this._hostingEnvironment = hostingEnvironment;
            this._cache = cache;
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
            this.EnsureFileVersionProvider();
            
            output.Attributes.Remove(srcAttribute);

            string path = this._fileVersionProvider.AddFileVersionToPath(this.Src);
            output.Content.SetHtmlContent(
                $"{this.PolyfillTest}||pf('{JavaScriptEncoder.Default.Encode(path)}')"
            );
        }

        private void EnsureFileVersionProvider() {
            if (this._fileVersionProvider == null) {
                this._fileVersionProvider = new FileVersionProvider(
                    this._hostingEnvironment.WebRootFileProvider,
                    this._cache, 
                    this.ViewContext.HttpContext.Request.PathBase);
            }
        }

        // We need this tag helper to execute as last
        public override int Order => 1000;
    }

    [HtmlTargetElement("link", Attributes = PolyfillTestAttribute)]
    public class LinkPolyfillTagHelper : TagHelper {
        private const string PolyfillTestAttribute = "fa-polyfill-test";
        private const string HtmlHrefAttribute = "href";

        private FileVersionProvider _fileVersionProvider;
        private readonly IMemoryCache _cache;
        private readonly IHostingEnvironment _hostingEnvironment;
        public LinkPolyfillTagHelper(IHostingEnvironment hostingEnvironment, IMemoryCache cache) {
            this._hostingEnvironment = hostingEnvironment;
            this._cache = cache;
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
            this.EnsureFileVersionProvider();

            output.Attributes.Remove(hrefAttribute);
            output.Attributes.RemoveAll("rel");

            string path = this._fileVersionProvider.AddFileVersionToPath(this.Href);
            output.TagName = "script";
            output.TagMode = TagMode.StartTagAndEndTag;
            output.Content.SetHtmlContent(
                $"{this.PolyfillTest}||ss('{JavaScriptEncoder.Default.Encode(path)}')"
            );
        }

        private void EnsureFileVersionProvider() {
            if (this._fileVersionProvider == null) {
                this._fileVersionProvider = new FileVersionProvider(
                    this._hostingEnvironment.WebRootFileProvider,
                    this._cache,
                    this.ViewContext.HttpContext.Request.PathBase);
            }
        }

        // We need this tag helper to execute as last
        public override int Order => 1000;
    }
}