// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppUserMutate.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    public class AppUserMutate : AppUserListing {
        public string NewPassword { get; set; }

        public string CurrentPassword { get; set; }
    }
}