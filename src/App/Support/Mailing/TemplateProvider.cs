// ******************************************************************************
//  � 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TemplateProcessor.cs
//  Project         : App
// ******************************************************************************

namespace App.Support.Mailing {
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using Microsoft.ApplicationInsights.AspNetCore.Extensions;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.FileProviders;

    public sealed class TemplateProvider {
        private const string TemplatePath = "Email/build/";
        private readonly string _baseUrl;
        private readonly IFileProvider _fileProvider;
        private readonly IAppVersionService _appVersionService;

        public TemplateProvider(IHostingEnvironment hostingEnvironment, IHttpContextAccessor httpContextAccessor, IAppVersionService appVersionService) {
            this._appVersionService = appVersionService;
            this._fileProvider = hostingEnvironment.ContentRootFileProvider;

            HttpRequest request = httpContextAccessor.HttpContext.Request;
            this._baseUrl = request.GetUri().GetLeftPart(UriPartial.Authority);
        }

        public async Task<Template> GetTemplateAsync(string name) {
            var nameWithExtension = Path.ChangeExtension(name, "html");
            var fullPath = TemplatePath + nameWithExtension;

            var file = this._fileProvider.GetFileInfo(fullPath);
            if (!file.Exists)
                throw new ArgumentException($"Template [{name}] at path [{fullPath}] does not exist", nameof(name));

            try {
                using (var sr = new StreamReader(file.CreateReadStream())) {
                    return new Template(await sr.ReadToEndAsync()).AddReplacement("base-url", this._baseUrl).AddReplacement("version", this._appVersionService.GetVersion());
                }
            }
            catch (Exception ex) {
                throw new ArgumentException($"Template [{name}] at path [{fullPath}] cannot be read", nameof(name), ex);
            }
        }
    }
}