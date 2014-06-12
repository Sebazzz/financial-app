namespace App.Models {
    using System.Runtime.Serialization;

    [DataContract]
    public class Category {
        [DataMember(Name="id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }
    }
}