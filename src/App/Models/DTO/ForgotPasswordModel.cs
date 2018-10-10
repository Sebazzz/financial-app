// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : ForgotPasswordModel.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System.ComponentModel.DataAnnotations;

    public class ForgotPasswordModel {
        [Required]
        public string User { get; set; }
    }
}