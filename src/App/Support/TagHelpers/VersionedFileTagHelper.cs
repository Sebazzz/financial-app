// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : VersionedFileTagHelper.cs
//  Project         : App
// ******************************************************************************
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace App.Support.TagHelpers
{

    [HtmlTargetElement("script", Attributes = VersionedFileAttribute)]
    [HtmlTargetElement("link", Attributes = VersionedFileAttribute)]
    public class VersionedFileTagHelper : IncludeTagHelperBase
    {
        private const string VersionedFileAttribute = "fa-versioned-file";

        [HtmlAttributeName(VersionedFileAttribute)]
        public bool VersionedFile { get; set; }

        private readonly IBuildAssetVersionCache _buildAssetVersionCache;

        /// <inheritdoc />
        public VersionedFileTagHelper(IBuildAssetVersionCache buildAssetVersionCache)
        {
            this._buildAssetVersionCache = buildAssetVersionCache;
        }

        /// <inheritdoc />
        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            if (!this.VersionedFile)
            {
                return;
            }

            string relativeSrc = this.MakeContentRelativePath(this.GetUrl(context));
            string matchedPath = this._buildAssetVersionCache.MatchFile(relativeSrc);

            if (string.IsNullOrEmpty(matchedPath))
            {
                return;
            }

            this.SetUrl(output, "/" + matchedPath);
        }
    }
}