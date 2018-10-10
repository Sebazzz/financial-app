// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : ResetPasswordModel.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public class ResetPasswordModel : TokenModel, IValidatableObject {
        [Required(ErrorMessage = "Voer een nieuw wachtwoord in")]
        public string NewPassword { get; set; }

        [Required(ErrorMessage = "Voer een nieuw wachtwoord nogmaals in")]
        public string NewPasswordConfirm { get; set; }
        /// <inheritdoc />
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (!string.IsNullOrEmpty(this.NewPasswordConfirm) && this.NewPassword != this.NewPasswordConfirm)
            {
                yield return new ValidationResult("De wachtwoorden komen niet overeen", new []{ nameof(this.NewPasswordConfirm) });
            }
        }
    }
}