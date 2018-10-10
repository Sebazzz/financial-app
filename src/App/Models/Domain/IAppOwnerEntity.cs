// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : IAppOwnerEntity.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain {
    public interface IAppOwnerEntity {
        AppOwner Owner { get; set; }
    }
}