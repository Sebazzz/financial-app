// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : ConfirmEmailMailer.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Mailing {
    using System;
    using System.Threading.Tasks;

    public class ConfirmEmailMailer {
        private const string TemplateName = "confirm-email";

        private readonly MailService _mailService;
        private readonly TemplateProvider _templateProvider;

        public ConfirmEmailMailer(MailService mailService, TemplateProvider templateProvider) {
            this._mailService = mailService;
            this._templateProvider = templateProvider;
        }

        public async Task SendAsync(string to, string baseUrl, string confirmToken, string userName) {
            var uriBuilder = new UriBuilder(baseUrl) {
                Path = "auth/confirm-email",
                Query = "token=" + Uri.EscapeDataString(confirmToken) + "&key=" + Uri.EscapeDataString(to)
            };

            Template template = await this._templateProvider.GetTemplateAsync(TemplateName);
            template.AddReplacement("user-name", userName);
            template.AddReplacement("confirm-email-link", uriBuilder.ToString());

            await this._mailService.SendAsync(to, template);
        }
    }
}