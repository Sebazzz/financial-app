// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : StringBuilderExtensions.cs
//  Project         : App
// ******************************************************************************
namespace App.Support {
    using System;
    using System.Text;

    internal static class StringBuilderExtensions {
        public static int IndexOf(this StringBuilder strBuilder, string search, int offset = 0) {
            if (String.IsNullOrEmpty(search) && strBuilder.Length == 0) {
                return 0;
            }

            for (var strIndex = offset; strIndex < strBuilder.Length; strIndex++) {
                var found = true;

                int searchIndex = 0;
                int strSearchIndex = strIndex;
                while(searchIndex < search.Length && strSearchIndex < strBuilder.Length) {
                    var searchChar = search[searchIndex];
                    var strChar = strBuilder[strSearchIndex];

                    if (searchChar != strChar) {
                        found = false;
                        break;
                    }

                    strSearchIndex++;
                    searchIndex++;
                }

                if (strSearchIndex >= strBuilder.Length &&
                    searchIndex < search.Length) {
                    found = false;
                }

                if (found) return strIndex;
            }

            return -1;
        }
    }
}