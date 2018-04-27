// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Template.cs
//  Project         : App
// ******************************************************************************

namespace App.Support.Mailing {
    using System;
    using System.Text;
    using System.Text.RegularExpressions;

    public sealed class Template {
        private readonly StringBuilder _contents;

        public Template(string contents) {
            this._contents = new StringBuilder(contents);
        }

        public void AddReplacement(string search, string replacement) {
            if (string.IsNullOrEmpty(search)) throw new ArgumentException(nameof(search));

            string searchToken = '{' + search + '}';
            this._contents.Replace(searchToken, replacement);
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

        public void HideSection(string sectionTitle) {
            string commentStart = $"<!-- {sectionTitle} -->";
            string commentEnd = $"<!-- /{sectionTitle} -->";

            int startIndex = this._contents.IndexOf(commentStart);
            if (startIndex == -1) {
                return;
            }

            int endIndex = this._contents.IndexOf(commentEnd, startIndex);
            if (endIndex == -1) {
                return;
            }

            int length = endIndex - startIndex + commentEnd.Length;
            this._contents.Remove(startIndex, length);
        }
    }

    public struct StringifiedTemplate {
        public string Body { get; set; }
        public string Title { get; set; }
    }
}