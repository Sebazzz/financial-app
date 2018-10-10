// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TwoFactorEnableNotificationMailer.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Mailing {
    using System.Threading.Tasks;

    public sealed class TwoFactorChangeNotificationMailer {
        private const string EnableTemplateName = "two-factor-enable-notification";
        private const string DisableTemplateName = "two-factor-disable-notification";

        private readonly MailService _mailService;
        private readonly TemplateProvider _templateProvider;

        public TwoFactorChangeNotificationMailer(MailService mailService, TemplateProvider templateProvider) {
            this._mailService = mailService;
            this._templateProvider = templateProvider;
        }

        public async Task SendAsync(string to, string userName, bool enable) {
            Template template = await this._templateProvider.GetTemplateAsync(enable ? EnableTemplateName : DisableTemplateName);
            template.AddReplacement("user-name", userName);

            await this._mailService.SendAsync(to, template);
        }
    }
}