// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TemplateProvider.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Mailing {
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.FileProviders;

    public sealed class TemplateProvider {
        private const string TemplatePath = "Email/build/";

        private readonly string _baseUrl;
        private readonly IFileProvider _fileProvider;
        private readonly IAppVersionService _appVersionService;

        public TemplateProvider(IWebHostEnvironment hostingEnvironment, ISiteUrlDetectionService siteUrlDetectionService, IAppVersionService appVersionService) {
            this._appVersionService = appVersionService;
            this._fileProvider = hostingEnvironment.ContentRootFileProvider;

            this._baseUrl = siteUrlDetectionService.GetSiteUrl();
        }

        public async Task<Template> GetTemplateAsync(string name) {
            string nameWithExtension = Path.ChangeExtension(name, "html");
            string fullPath = TemplatePath + nameWithExtension;

            IFileInfo file = this._fileProvider.GetFileInfo(fullPath);
            if (!file.Exists)
                throw new ArgumentException($"Template [{name}] at path [{fullPath}] does not exist", nameof(name));

            try {
                using (var sr = new StreamReader(file.CreateReadStream())) {
                    var template = new Template(await sr.ReadToEndAsync());
                    template.AddReplacement("base-url", this._baseUrl);
                    template.AddReplacement("version", this._appVersionService.GetVersion());

                    return template;
                }
            }
            catch (Exception ex) {
                throw new ArgumentException($"Template [{name}] at path [{fullPath}] cannot be read", nameof(name), ex);
            }
        }
    }
}