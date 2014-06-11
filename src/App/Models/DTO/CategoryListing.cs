namespace App.Models.DTO {
    using System.Runtime.Serialization;

    [DataContract]
    public class CategoryListing {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }

        [DataMember(Name = "canBeDeleted")]
        public bool CanBeDeleted { get; set; }
    }
}