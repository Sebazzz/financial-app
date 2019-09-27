// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Template.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Mailing {
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Text.RegularExpressions;

    [StructLayout(LayoutKind.Auto)]
    public struct TemplateReplacementList {
        private readonly StringBuilder _contents;
        private readonly int _offset;

        public TemplateReplacementList(StringBuilder contents, int offset) {
            this._offset = offset;
            this._contents = contents;
        }
        public TemplateReplacementList Replace(string search, string replacement) {
            string searchToken = '{' + search + '}';
            this._contents.Replace(searchToken, replacement, this._offset, this._contents.Length - this._offset);

            return this;
        }
    }

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

        public void RepeatSection<T>(string sectionName, ICollection<T> data, Action<T, TemplateReplacementList> dataBindAction) {
            if (data.Count == 0) {
                this.RemoveSection(sectionName);
                return;
            }

            (int StartIndex, int Length, int InnerStartIndex, int InnerLength)? section = this.FindSection(sectionName);

            if (section == null) {
                return;
            }

            (int startIndex, int length, int innerStartIndex, int innerLength) = section.Value;

            // We know how many items we got, so iterate reverse and append save one
            // ... Strip end comment
            int endCommentLength = length - innerLength - (innerStartIndex - startIndex);
            this._contents.Remove(innerStartIndex + innerLength, endCommentLength);

            // ... Prepare repeated template insertion
            int insertOffset = innerStartIndex + innerLength;
            var templateSource = new char[innerLength];
            this._contents.CopyTo(innerStartIndex, templateSource, 0, templateSource.Length);

            foreach (T dataItem in data.Skip(1).Reverse()) {
                this._contents.Insert(insertOffset, templateSource);
                dataBindAction.Invoke(dataItem, new TemplateReplacementList(this._contents, insertOffset));
            }

            // ... Replace final string - first item
            {
                T dataItem = data.First();
                dataBindAction.Invoke(dataItem, new TemplateReplacementList(this._contents, innerStartIndex));

                this._contents.Remove(startIndex, innerStartIndex - startIndex);
            }
        }

        public override string ToString() {
            return this._contents.ToString();
        }

        public void RemoveSection(string sectionName) {
            var section = this.FindSection(sectionName);

            if (section == null) {
                return;
            }

            (int startIndex, int length, _, _) = section.Value;
            this._contents.Remove(startIndex, length);
        }

        private (int StartIndex, int Length, int InnerStartIndex, int InnerLength)? FindSection(string sectionName) {
            string commentStart = $"<!-- {sectionName} -->";
            string commentEnd = $"<!-- /{sectionName} -->";

            int outerStartIndex = this._contents.IndexOf(commentStart);
            if (outerStartIndex == -1) {
                return null;
            }

            int innerEndIndex = this._contents.IndexOf(commentEnd, outerStartIndex);
            if (innerEndIndex == -1) {
                return null;
            }

            int innerStartIndex = commentStart.Length + outerStartIndex;
            int outerLength = commentEnd.Length + innerEndIndex - outerStartIndex;
            int innerLength = outerLength - commentStart.Length - commentEnd.Length;

            return (outerStartIndex, outerLength, innerStartIndex, innerLength);
        }
    }

    public struct StringifiedTemplate {
        public string Body { get; set; }
        public string Title { get; set; }
    }
}