// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppBuilderExtensions.cs
//  Project         : App
// ******************************************************************************

namespace App.Support.DataProtection {
    using System;
    using System.IO;
    using System.Security.Cryptography.X509Certificates;
    using Microsoft.AspNetCore.DataProtection;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;

    internal static class ServiceCollectionExtensions {
        public static void AddConfiguredDataProtection(this IServiceCollection services, IConfiguration configuration)
        {
            var dataProtectionOptions = configuration.GetValue<DataProtectionOptions>("DataProtection");

            if (dataProtectionOptions == null)
            {
                // Automatic - let ASP.NET Core defaults in place
                return;
            }

            IDataProtectionBuilder dataProtectionBuilder;
            switch (dataProtectionOptions.StorageOptions?.Type ?? DataProtectionStorageType.InMemory)
            {
                case DataProtectionStorageType.InMemory:
                    dataProtectionBuilder = ConfigureForInMemory(services);
                    break;
                case DataProtectionStorageType.File:
                    dataProtectionBuilder = ConfigureForFile(services, dataProtectionOptions);
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }

            switch (dataProtectionOptions.Protection)
            {
                case DataProtectionProtectionType.None:
                    break;
                case DataProtectionProtectionType.Certificate:
                    ConfigureForCertificate(dataProtectionBuilder, dataProtectionOptions);
                    break;
                case DataProtectionProtectionType.Windows:
                    ConfigureWindowProtection(dataProtectionBuilder);
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }

            if (dataProtectionOptions.Lifetime != null)
            {
                dataProtectionBuilder.SetDefaultKeyLifetime(dataProtectionOptions.Lifetime.Value);
            }
        }

        private static void ConfigureWindowProtection(IDataProtectionBuilder dataProtectionBuilder) => dataProtectionBuilder.ProtectKeysWithDpapi();

        private static IDataProtectionBuilder ConfigureForInMemory(IServiceCollection services) => services.AddConfiguredDataProtection().UseEphemeralDataProtectionProvider();

        private static IDataProtectionBuilder ConfigureForFile(IServiceCollection services, DataProtectionOptions dataProtectionOptions)
        {
            IDataProtectionBuilder builder = services.AddConfiguredDataProtection();
            DataProtectionStorageOptions storageOptions = dataProtectionOptions.File;

            if (storageOptions == null)
            {
                throw new InvalidOperationException($"{nameof(DataProtectionOptions)}:{nameof(dataProtectionOptions.File)} not set");
            }

            if (storageOptions.Path == "auto")
            {
                storageOptions.Path = EnvironmentPath.CreatePath("key-store");
            }

            var directory = new DirectoryInfo(storageOptions.Path);
            directory.Create();

            builder.PersistKeysToFileSystem(
                directory
            );

            return builder;
        }

        private static void ConfigureForCertificate(IDataProtectionBuilder builder, DataProtectionOptions dataProtectionOptions)
        {
            CertificateDataProtectionOptions certificateOptions = dataProtectionOptions.Certificate;

            if (certificateOptions == null)
            {
                throw new InvalidOperationException($"{nameof(DataProtectionOptions)}:{nameof(dataProtectionOptions.Certificate)} not set");
            }

            certificateOptions.Validate();

            var certificate = new X509Certificate2(certificateOptions.CertificatePath, certificateOptions.Password);

            builder.ProtectKeysWithCertificate(
                certificate
            );
        }

        private static IDataProtectionBuilder AddConfiguredDataProtection(this IServiceCollection services)
        {
            return services.AddDataProtection(options => options.ApplicationDiscriminator = "financial-app");
        }
    }

    internal sealed class DataProtectionOptions
    {
        public DataProtectionProtectionType Protection { get; set; } = DataProtectionProtectionType.None;

        public DataProtectionStorageOptions File { get;set; }
        public CertificateDataProtectionOptions Certificate { get;set; }

        public DataProtectionStorageOptions StorageOptions { get; set; }

        public TimeSpan? Lifetime { get; set; }
    }

    internal sealed class DataProtectionStorageOptions
    {
        public string Path { get; set; }

        public DataProtectionStorageType Type { get; set; } = DataProtectionStorageType.InMemory;
    }

    internal sealed class CertificateDataProtectionOptions
    {
        /// <summary>
        /// Path to PFX certificate
        /// </summary>
        public string CertificatePath { get; set; }

        public string Password { get; set; }

        public void Validate()
        {
            if (String.IsNullOrEmpty(this.CertificatePath) || !File.Exists(this.CertificatePath))
            {
                throw new InvalidOperationException($"Certificate path '{this.CertificatePath}' does not exist");
            }

            if (String.IsNullOrEmpty(this.Password))
            {
                throw new InvalidOperationException("No password has been given for certificate");
            }
        }
    }

    internal enum DataProtectionStorageType
    {
        InMemory,
        File
    }

    internal enum DataProtectionProtectionType
    {
        None,
        Certificate,
        Windows
    }
}
