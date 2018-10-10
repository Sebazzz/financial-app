// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TagListing.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO {
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract]
    public class TagListing {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        [Required(ErrorMessage = "De naam is verplicht")]
        [StringLength(128, MinimumLength = 2, ErrorMessage = "De naam is verplicht")]
        public string Name { get; set; }

        [DataMember]
        public string Description { get; set; }

        [DataMember]
        [RegularExpression("^([A-F]|[a-f]|[0-9]){6}$", ErrorMessage = "Hexadecimale code bestaat uit precies zes karakters A-F.")]
        public string HexColorCode { get; set; }
    }
}