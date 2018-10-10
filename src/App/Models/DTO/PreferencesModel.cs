// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : PreferencesModel.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO
{
    public class PreferencesModel
    {
        public bool EnableMonthlyDigest { get; set; }
        public bool EnableLoginNotifications { get; set; }
        public bool GoToHomePageAfterContextSwitch { get; set; }
    }
}