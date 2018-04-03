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
    }
}