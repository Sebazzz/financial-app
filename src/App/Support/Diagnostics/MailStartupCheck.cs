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
    using System.Threading;
    using System.Threading.Tasks;
    using Mailing;
    using MailKit.Net.Smtp;
    using Microsoft.Extensions.Options;
    using MimeKit;

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
                // Using MailKit we can simple connect and authenticate without sending mail
                using (SmtpClient smtpClient = this.CreateConnectedSmtpClient())
                {
                    smtpClient.NoOp();
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

        private SmtpClient CreateConnectedSmtpClient()
        {
            try
            {
                var smtpClient = new SmtpClient();

                smtpClient.Connect(
                    this._mailSettings.Host,
                    this._mailSettings.Port,
                    this._mailSettings.EnableSSL,
                    CancellationToken.None
                );

                if (this._mailSettings.HasAuthenticationInfo)
                {
                    smtpClient.Authenticate(
                        this._mailSettings.UserName,
                        this._mailSettings.Password
                    );
                }

                return smtpClient;
            }
            catch (Exception ex)
            {
                throw new MailServiceException($"Unable to create SMTP client for host {this._mailSettings.Host}", ex);
            }
        }
    }
}
