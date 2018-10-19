// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AuthenticatorAttestationRawResponse.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.DTO.WebAuthn {
    using System.Runtime.Serialization;
    using Newtonsoft.Json;
    using Support;

    [DataContract]
    public class AuthenticatorAttestationRawResponse {
        [DataMember(Name = "id")]
        [JsonConverter(typeof(Base64UrlConverter))]
        public byte[] Id { get; set; }

        [DataMember(Name = "rawId")]
        [JsonConverter(typeof(Base64UrlConverter))]
        public byte[] RawId { get; set; }

        [DataMember(Name = "type")]
        public string Type { get; set; }

        [DataMember(Name = "response")]
        public AuthenticatorAttestationRawResponseData Response { get; set; }
    }
}