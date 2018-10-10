// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : PasswordChangeNotificationMailer.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Mailing {
    using System.Threading.Tasks;

    public sealed class PasswordChangeNotificationMailer {
        private const string TemplateName = "password-change-notification";

        private readonly MailService _mailService;
        private readonly TemplateProvider _templateProvider;

        public PasswordChangeNotificationMailer(MailService mailService, TemplateProvider templateProvider) {
            this._mailService = mailService;
            this._templateProvider = templateProvider;
        }

        public async Task SendAsync(string to, string userName) {
            Template template = await this._templateProvider.GetTemplateAsync(TemplateName);
            template.AddReplacement("user-name", userName);

            await this._mailService.SendAsync(to, template);
        }
    }
}