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
}