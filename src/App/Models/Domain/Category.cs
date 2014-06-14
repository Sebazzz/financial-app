namespace App.Models.Domain {
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract]
    public class Category {
        [DataMember(Name="id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        [Required]
        [StringLength(250, MinimumLength = 2)]
        public string Name { get; set; }

        [IgnoreDataMember]
        [Required]
        public virtual AppOwner Owner { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }
    }
}