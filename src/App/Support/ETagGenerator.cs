namespace App.Support {
    using System;
    using Microsoft.Extensions.FileProviders;

    public sealed class ETagGenerator : IETagGenerator {
        public string GenerateETag(IFileInfo fileInfo) {
            long length = fileInfo.Length;

            DateTimeOffset last = fileInfo.LastModified;

            // truncat last modified time to seconds
            DateTimeOffset lastModified = new DateTimeOffset(last.Year, last.Month, last.Day, last.Hour, last.Minute, last.Second,last.Offset);

            long etagHash = lastModified.ToFileTime() ^ length;
            return Convert.ToString(etagHash, 16);
        }
    }
}