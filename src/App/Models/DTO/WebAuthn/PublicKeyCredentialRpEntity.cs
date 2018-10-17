// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : PublicKeyCredentialRpEntity.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO.WebAuthn {
    using System.Runtime.Serialization;

    [DataContract]
    public class PublicKeyCredentialRpEntity : PublicKeyCredentialEntity {
        [DataMember(Name = "id")]
        public string Id { get; set; }
    }
}