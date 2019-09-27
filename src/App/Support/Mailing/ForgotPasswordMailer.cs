// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : ForgotPasswordMailer.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Mailing {
    using System;
    using System.Threading.Tasks;

    public sealed class ForgotPasswordMailer {
        private const string TemplateName = "forgot-password";

        private readonly MailService _mailService;
        private readonly TemplateProvider _templateProvider;

        public ForgotPasswordMailer(MailService mailService, TemplateProvider templateProvider) {
            this._mailService = mailService;
            this._templateProvider = templateProvider;
        }

        public async Task SendAsync(string to, string baseUrl, string resetToken) {
            var uriBuilder = new UriBuilder(baseUrl) {
                Path = "auth/reset-password",
                Query = "token=" + Uri.EscapeDataString(resetToken) + "&key=" + Uri.EscapeDataString(to)
            };

            Template template = await this._templateProvider.GetTemplateAsync(TemplateName);
            template.AddReplacement("forgot-password-link", uriBuilder.ToString());

            await this._mailService.SendAsync(to, template);
        }
    }
}