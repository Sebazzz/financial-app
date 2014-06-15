namespace App.Models.DTO {
    using System.Runtime.Serialization;

    [DataContract]
    public sealed class LoginModel {
        [DataMember(Name = "userName")]
        public string UserName { get; set; }
        [DataMember(Name = "password")]
        public string Password { get; set; }
        [DataMember(Name = "persistent")]
        public bool Persistent { get; set; }
    }
}