// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AuthenticationInfo.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System.Runtime.Serialization;

    [DataContract]
    public sealed class AuthenticationInfo {
        [DataMember]
        public bool IsAuthenticated { get; set; }

        [DataMember]
        public bool IsLockedOut {get;set;}

        [DataMember]
        public bool IsTwoFactorAuthenticationRequired {get;set;}

        [DataMember]
        public int? PreviousActiveOwnedGroupId { get; set; }

        [DataMember]
        public string CurrentGroupName { get; set; }

        [DataMember]
        public int UserId { get; set; }

        [DataMember]
        public string UserName { get; set; }

        [DataMember]
        public string[] Roles { get; set; } = new string[0];
    }
}