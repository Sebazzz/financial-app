namespace App.Models.DTO {
    using System.Runtime.Serialization;

    [DataContract]
    public sealed class AuthenticationInfo {
        [DataMember(Name = "isAuthenticated")]
        public bool IsAuthenticated { get; set; }

        [DataMember(Name = "userId")]
        public int UserId { get; set; }

        [DataMember(Name = "userName")]
        public string UserName { get; set; }
    }
}