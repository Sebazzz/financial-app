using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;

namespace App.Support.Mailing {

    public sealed class TemplateProvider {
        private const string TemplatePath = "~/Email/build";

        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly string _baseUrl;
        private readonly IFileProvider _fileProvider;

        public TemplateProvider(IHostingEnvironment hostingEnvironment, HttpContext httpContext) {
            this._fileProvider = hostingEnvironment.ContentRootFileProvider;

            var request = httpContext.Request;
            var url = new UriBuilder();
            url.Scheme = request.Scheme;
            url.Host = request.Host.Host;
            
            this._baseUrl = url.Uri.GetLeftPart(UriPartial.Authority);
        }

        public async Task<Template> GetTemplateAsync(string name) {
            string nameWithExtension = System.IO.Path.ChangeExtension(name, "html");
            string fullPath = TemplatePath + nameWithExtension;

            var file = this._fileProvider.GetFileInfo(fullPath);
            if (!file.Exists) {
                throw new ArgumentException($"Template [{name}] at path [{fullPath}] does not exist", nameof(name));
            }

            try {
                using (StreamReader sr = new StreamReader(file.CreateReadStream())) {
                    return (new Template(await sr.ReadToEndAsync())).AddReplacement("base-url", this._baseUrl);
                }
            } catch (Exception ex) {
                throw new ArgumentException($"Template [{name}] at path [{fullPath}] cannot be read", nameof(name), ex);
            }
        }
    }

    public sealed class Template {
        private readonly string _contents;
        private readonly Dictionary<string, string> _replacements = new Dictionary<string, string>();
        public Template(string contents) {
            this._contents = contents;
        }

        public Template AddReplacement(string search, string replacement) {
            if (String.IsNullOrEmpty(search)) {
                throw new ArgumentException(nameof(search));
            }

            this._replacements['{' + search + '}'] = replacement;

            return this;
        }

        public string Stringify() {
            StringBuilder sb = new StringBuilder(this._contents);

            foreach (var kvp in this._replacements) {
                sb.Replace(kvp.Key, kvp.Value);
            }

            return sb.ToString();
        }

        public override string ToString() => this._contents;
    }
}