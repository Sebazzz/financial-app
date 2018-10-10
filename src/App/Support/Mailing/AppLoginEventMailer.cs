// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppLoginEventMailer.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Mailing {
    using System.Threading.Tasks;
    using Models.Domain.Identity;

    public class AppUserLoginEventMailer {
        private const string TemplateName = "login-notification";

        private readonly MailService _mailService;
        private readonly TemplateProvider _templateProvider;

        public AppUserLoginEventMailer(MailService mailService, TemplateProvider templateProvider) {
            this._mailService = mailService;
            this._templateProvider = templateProvider;
        }

        public async Task SendAsync(AppUserLoginEvent loginEvent) {
            Template template = await this._templateProvider.GetTemplateAsync(TemplateName);
            template.AddReplacement("user-name", loginEvent.User.UserName);
            template.AddReplacement("user-agent", loginEvent.UserAgent ?? "Onbekend");
            template.AddReplacement("timestamp", loginEvent.Timestamp.ToString("F"));
            template.AddReplacement("ip-address", loginEvent.IPAddress);

            await this._mailService.SendAsync(loginEvent.User.Email, template);
        }
    }
}