// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : PublicKeyCredentialUserEntity.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO.WebAuthn {
    using System.Runtime.Serialization;

    [DataContract]
    public class PublicKeyCredentialUserEntity : PublicKeyCredentialEntity {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "displayName")]
        public string DisplayName { get; set; }
    }
}