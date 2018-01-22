// ******************************************************************************
//  © 2017 Ernst & Young - www.ey.com | www.beco.nl
// 
//  Author          : Ernst & Young - Cleantech and Sustainability
//  File:           : CurrencyDeltaValidationAttribute.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.Validation {
    using System.ComponentModel.DataAnnotations;

    public sealed class CurrencyDeltaValidationAttribute : ValidationAttribute {
        protected override ValidationResult IsValid(object rawValue, ValidationContext validationContext) {
            decimal? value = (decimal?) rawValue;

            if (value == 0) {
                return new ValidationResult("Voer een getal in groter of kleiner dan 0", new []{ validationContext.MemberName });
            }

            return ValidationResult.Success;
        }
    }
}
