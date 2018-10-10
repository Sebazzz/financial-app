// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : LoginModel.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract]
    public sealed class LoginModel {
        [DataMember]
        [Required]
        public string UserName { get; set; }
        [Required]
        [DataMember]
        public string Password { get; set; }
        [DataMember]
        public bool Persistent { get; set; }
    }

    [DataContract]
    public sealed class LoginTwoFactorAuthenticationModel {
        [DataMember]
        [Required]
        public string VerificationCode { get; set; }

        [DataMember]
        public bool Persistent { get; set; }

        [DataMember]
        public bool IsRecoveryCode { get; set; }

        [DataMember]
        public bool RememberClient { get;set; }
    }

    [DataContract]
    public sealed class ChangeGroupModel {
        [DataMember]
        public int GroupId { get; set; }
    }
}