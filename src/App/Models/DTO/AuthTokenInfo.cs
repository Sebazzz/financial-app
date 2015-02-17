namespace App.Models.DTO {
    using System.Runtime.Serialization;

    /// <summary>
    /// Not actually used by our API but let our T4 generate the interface :)
    /// </summary>
    [DataContract]
    public sealed class AuthTokenInfo {
        [DataMember(Name = "access_token")]
        public string AccessToken { get; set; }
        [DataMember]
        public string UserName { get; set; }
    }
}