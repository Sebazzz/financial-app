namespace App.Support {
    using Microsoft.Extensions.FileProviders;

    public interface IETagGenerator {
        string GenerateETag(IFileInfo fileInfo);
    }
}