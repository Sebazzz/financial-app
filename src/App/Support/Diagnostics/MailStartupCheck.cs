// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : MailStartupCheck.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Diagnostics
{
    using System;
    using System.Net;
    using System.Net.Mail;
    using Mailing;
    using Microsoft.Extensions.Options;

    internal sealed class MailStartupCheck : IStartupCheck
    {
        private readonly MailSettings _mailSettings;

        public MailStartupCheck(IOptions<MailSettings> mailSettings)
        {
            this._mailSettings = mailSettings.Value;
        }

        public StartupCheckResult Run()
        {
            if (this._mailSettings.SkipTest)
            {
                return StartupCheckResult.Success("SkipTest is set - mail check is being skipped.");
            }

            if (this._mailSettings == null || this._mailSettings.Port == 0 || string.IsNullOrEmpty(this._mailSettings.FromAddress))
                return StartupCheckResult.Success("SMTP settings are not set");

            try
            {
                using (var smtpClient = this.CreateSmtpClient())
                {
                    smtpClient.Send(this._mailSettings.FromAddress, this._mailSettings.TestMailTarget ?? "void@example.com", "Test e-mail", "Startup-check");
                }
            }
            catch (Exception ex)
            {
                return StartupCheckResult.Failure(
                    $"Unable to connect to SMTP server at {this._mailSettings.Host}:{this._mailSettings.Port}", ex);
            }

            return StartupCheckResult.Success(
                $"Connected to SMTP server at {this._mailSettings.Host}:{this._mailSettings.Port}");
        }

        public string Description => "E-mail (SMTP) connection";

        private SmtpClient CreateSmtpClient()
        {
            try
            {
                return new SmtpClient
                {
                    Host = this._mailSettings.Host,
                    Port = this._mailSettings.Port,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    EnableSsl = this._mailSettings.EnableSSL,
                    Credentials = new NetworkCredential
                    {
                        UserName = this._mailSettings.UserName,
                        Password = this._mailSettings.Password
                    }
                };
            }
            catch (Exception ex)
            {
                throw new MailServiceException($"Unable to create SMTP client for host {this._mailSettings.Host}", ex);
            }
        }
    }
}