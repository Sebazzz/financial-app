// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Template.cs
//  Project         : App
// ******************************************************************************

namespace App.Support.Mailing {
    using System;
    using System.Collections.Generic;
    using System.Text;
    using System.Text.RegularExpressions;

    public sealed class Template {
        private readonly string _contents;
        private readonly Dictionary<string, string> _replacements = new Dictionary<string, string>();

        public Template(string contents) {
            this._contents = contents;
        }

        public Template AddReplacement(string search, string replacement) {
            if (string.IsNullOrEmpty(search)) throw new ArgumentException(nameof(search));

            this._replacements['{' + search + '}'] = replacement;

            return this;
        }

        public StringifiedTemplate Stringify() {
            StringBuilder sb = new StringBuilder(this._contents);

            foreach (var item in this._replacements) sb.Replace(item.Key, item.Value);

            string body = sb.ToString();
            string title = Regex.Match(body, "<title>(?<content>.*)</title>", RegexOptions.IgnoreCase).Groups["content"]?.Value.Trim();

            return new StringifiedTemplate {
                Body = body,
                Title = title
            };
        }

        public override string ToString() {
            return this._contents;
        }
    }

    public struct StringifiedTemplate {
        public string Body { get; set; }
        public string Title { get; set; }
    }
}