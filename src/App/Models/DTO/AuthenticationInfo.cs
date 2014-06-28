namespace App.Models.DTO {
    using System.Runtime.Serialization;

    [DataContract]
    public sealed class AuthenticationInfo {
        [DataMember]
        public bool IsAuthenticated { get; set; }

        [DataMember]
        public int UserId { get; set; }

        [DataMember]
        public string UserName { get; set; }
    }
}