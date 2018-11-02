// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppUserListing.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System;
    using System.ComponentModel.DataAnnotations;

    public class AppUserListing {
        [Required(ErrorMessage = "Het e-mail adres is verplicht")]
        [RegularExpression("(.*)@(.*)", ErrorMessage = "Vul een geldig e-mail adres in")]
        public string Email { get; set; }

        [Required(ErrorMessage = "De gebruikersnaam is verplicht")]
        public string UserName { get; set; }

        public int Id { get; set; }
    }

    public class AppImpersonationUserListing : AppUserListing {
        public DateTimeOffset ActiveSince { get; set; }
        public int GroupId { get; set; }
    }

    public class AppAllowedImpersonation : AppImpersonationUserListing {
        public string SecurityToken { get; set; }
    }

    public class OutstandingImpersonation : SecurityTokenModel {
        public DateTimeOffset CreationDate { get; set; }
    }

    public class SecurityTokenModel {
        [Required(ErrorMessage = "De beveiligingscode is verplicht")]
        public string SecurityToken { get; set; }
    }
}