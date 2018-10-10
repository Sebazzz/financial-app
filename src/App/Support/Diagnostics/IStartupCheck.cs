// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : IStartupCheck.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Diagnostics {
    internal interface IStartupCheck {
        string Description { get; }
        StartupCheckResult Run();
    }
}