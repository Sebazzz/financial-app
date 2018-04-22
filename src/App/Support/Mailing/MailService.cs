﻿// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : MailService.cs
//  Project         : App
// ******************************************************************************

namespace App.Support.Mailing {
    using System;
    using System.Net;
    using System.Net.Mail;
    using System.Threading.Tasks;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;

    public sealed class MailService {
        private readonly MailSettings _mailSettings;
        private readonly ILogger<MailService> _logger;

        public MailService(IOptions<MailSettings> mailSettings, ILogger<MailService> logger) {
            this._logger = logger;
            this._mailSettings = mailSettings.Value;
        }

        public async Task SendAsync([App.NotNull] string to, Template template) {
            if (to == null) throw new ArgumentNullException(nameof(to));

            this.ValidateSettings();

            using (SmtpClient smtpClient = this.CreateSmtpClient()) {
                StringifiedTemplate stringifiedTemplate = template.Stringify();

                this._logger.LogInformation($"Going to send mail [{stringifiedTemplate.Title}] to {to}");

                try {
                    MailMessage mailMessage = new MailMessage {
                        From = new MailAddress(this._mailSettings.FromAddress, this._mailSettings.FromDisplayName),
                        To = {
                            to
                        },

                        Subject = stringifiedTemplate.Title,
                        Body = stringifiedTemplate.Body,
                        IsBodyHtml = true,
                    };

                    await smtpClient.SendMailAsync(mailMessage);

                    this._logger.LogInformation($"Sent mail [{stringifiedTemplate.Title}] to {to}");
                }
                catch (Exception ex) {
                    this._logger.LogError(ex, $"Unable to send mail to {to} via {this._mailSettings.Host}:{this._mailSettings.Port}");

                    throw new MailServiceException($"Unable to send mail to {to} via {this._mailSettings.Host}:{this._mailSettings.Port}", ex);
                }
            }
        }

        private void ValidateSettings() {
            if (this._mailSettings == null) {
                throw new MailServiceException();
            }

            if (this._mailSettings.Port == 0) {
                throw new MailServiceException($"SMTP port not set: {this._mailSettings.Port}");
            }

            if (String.IsNullOrEmpty(this._mailSettings.FromAddress)) {
                throw new MailServiceException("SMTP 'from' address not set");
            }

            if (String.IsNullOrEmpty(this._mailSettings.Host)) {
                throw new MailServiceException("SMTP 'host' address not set");
            }
        }

        private SmtpClient CreateSmtpClient() {
            try {
                return new SmtpClient {
                    Host = this._mailSettings.Host,
                    Port = this._mailSettings.Port,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    EnableSsl = this._mailSettings.EnableSSL,
                    Credentials = new NetworkCredential {
                        UserName = this._mailSettings.UserName,
                        Password = this._mailSettings.Password
                    }
                };
            }
            catch (Exception ex) {
                this._logger.LogError(ex, $"Unable to create SMTP client for {this._mailSettings.Host}:{this._mailSettings.Port}");

                throw new MailServiceException($"Unable to create SMTP client for host {this._mailSettings.Host}", ex);
            }
        }
    }


    public class MailServiceException : Exception {
        public MailServiceException() { }
        public MailServiceException(string message) : base(message) { }
        public MailServiceException(string message, Exception innerException) : base(message, innerException) { }
    }
}