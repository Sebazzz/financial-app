namespace App.Support {
    using Microsoft.AspNet.FileProviders;

    public interface IETagGenerator {
        string GenerateETag(IFileInfo fileInfo);
    }
}