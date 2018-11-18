// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Tag.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain {
    using System.ComponentModel.DataAnnotations;
    using Repositories;

    /// <summary>
    /// Represents a tag - a way to organise related expenses. Like "Christmas presents 2017". An expense can have zero or more tags.
    /// </summary>
    public class Tag : IHasId, IAppOwnerEntity {
        public virtual AppOwner Owner { get; set; }
        public int OwnerId { get; set; }

        public int Id { get; set; }

        public string Name { get; set; }
        public string Description { get; set; }

        [StringLength(6,MinimumLength = 6)]
        public string HexColorCode { get; set; }

        public bool IsInactive { get; set; }
    }

    /// <summary>
    /// Workaround for EF not supporting many-to-many
    /// </summary>
    public class SheetEntryTag {
        [Required]
        public virtual SheetEntry SheetEntry { get; set; }
        public int SheetEntryId { get; set; }

        [Required]
        public virtual Tag Tag { get; set; }

        public int TagId { get; set; }

        public int Id { get; set; }

        public static SheetEntryTag Create(SheetEntry owner, Tag tag) {
            return new SheetEntryTag {
                SheetEntry = owner,
                Tag = tag
            };
        }
    }
}
