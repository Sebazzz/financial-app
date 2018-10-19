// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AuthenticatorAttestationRawResponseData.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.DTO.WebAuthn {
    using System.Runtime.Serialization;
    using Newtonsoft.Json;
    using Support;

    [DataContract]
    public class AuthenticatorAttestationRawResponseData {
        [DataMember(Name = "attestationObject")]
        [JsonConverter(typeof(Base64UrlConverter))]
        public byte[] AttestationObject { get; set; }

        [JsonConverter(typeof(Base64UrlConverter))]
        [DataMember(Name = "clientDataJson")]
        public byte[] ClientDataJson { get; set; }
    }
}