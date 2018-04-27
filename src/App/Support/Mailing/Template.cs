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
        private readonly StringBuilder _contents;

        public Template(string contents) {
            this._contents = new StringBuilder(contents);
        }

        public Template AddReplacement(string search, string replacement) {
            if (string.IsNullOrEmpty(search)) throw new ArgumentException(nameof(search));

            string searchToken = '{' + search + '}';
            this._contents.Replace(searchToken, replacement);

            return this;
        }

        public StringifiedTemplate Stringify() {
            string body = this._contents.ToString();
            string title = Regex.Match(body, "<title>(?<content>.*)</title>", RegexOptions.IgnoreCase).Groups["content"]?.Value.Trim();

            return new StringifiedTemplate {
                Body = body,
                Title = title
            };
        }

        public override string ToString() {
            return this._contents.ToString();
        }
    }

    public struct StringifiedTemplate {
        public string Body { get; set; }
        public string Title { get; set; }
    }
}