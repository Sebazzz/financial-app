// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TokenModel.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System.ComponentModel.DataAnnotations;

    public class TokenModel {
        [Required]
        public string Token { get; set; }

        [Required]
        public string Key { get; set; }
    }
}