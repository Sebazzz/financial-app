// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : IHasId.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain {
    public interface IHasId {
        int Id { get; }
    }
}