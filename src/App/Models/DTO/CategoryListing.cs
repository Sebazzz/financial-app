// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : CategoryListing.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System.Runtime.Serialization;

    [DataContract]
    public class CategoryListing {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string Description { get; set; }

        [DataMember]
        public bool CanBeDeleted { get; set; }
    }
}