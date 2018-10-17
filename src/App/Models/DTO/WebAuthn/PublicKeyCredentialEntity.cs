// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : PublicKeyCredentialEntity.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO.WebAuthn {
    using System.Runtime.Serialization;

    [DataContract]
    public abstract class PublicKeyCredentialEntity {
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "icon")]
        public string Icon { get; set; }
    }
}