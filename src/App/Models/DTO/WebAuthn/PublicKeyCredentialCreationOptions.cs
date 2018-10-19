// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : PublicKeyCredentialCreationOptions.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.DTO.WebAuthn {
    using System.Runtime.Serialization;
    using Newtonsoft.Json;
    using Support;

    [DataContract]
    public class PublicKeyCredentialCreationOptions {
        [DataMember(Name = "rp")]
        public PublicKeyCredentialRpEntity RelyingParty { get; set; }

        [DataMember(Name = "user")]
        public PublicKeyCredentialUserEntity User { get; set; }

        [DataMember(Name = "challenge")]
        [JsonConverter(typeof(Base64UrlConverter))]
        public byte[] Challenge { get; set; }

        [DataMember(Name = "pubKeyCredParams")]
        public PublicKeyCredentialParameters[] PublicKeyCredentialParameters { get; set; }
    }
}