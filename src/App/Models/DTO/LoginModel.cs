namespace App.Models.DTO {
    using System.Runtime.Serialization;

    [DataContract]
    public sealed class LoginModel {
        [DataMember]
        public string UserName { get; set; }
        [DataMember]
        public string Password { get; set; }
        [DataMember]
        public bool Persistent { get; set; }
    }
}