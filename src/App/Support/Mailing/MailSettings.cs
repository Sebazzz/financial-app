// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : MailSettings.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Mailing
{
    using System;

    public sealed class MailSettings
    {
        public int Port { get; set; }
        public bool SkipTest { get; set; }
        public bool EnableSSL { get; set; }
        public string Host { get; set; }
        public string FromAddress { get; set; }
        public string FromDisplayName { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }

        public bool HasAuthenticationInfo => !String.IsNullOrEmpty(this.UserName);
    }
}
