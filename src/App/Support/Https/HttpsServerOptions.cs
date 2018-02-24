namespace App.Support.Https
{
    public sealed class HttpsServerOptions
    {
        public string CertificatePath { get; set; }
        public string CertificatePassword { get; set; }

        public bool EnableRedirect { get; set; }

        public bool UseStrongHttps { get; set; }
    }
}