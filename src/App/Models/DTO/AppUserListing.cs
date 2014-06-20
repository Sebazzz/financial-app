namespace App.Models.DTO {
    using System.Runtime.Serialization;

    [DataContract]
    public class AppUserListing {
        [DataMember(Name = "email")]
        public string Email { get; set; }

        [DataMember(Name = "userName")]
        public string UserName { get; set; }

        [DataMember(Name = "id")]
        public int Id { get; set; }
    }

    [DataContract]
    public class AppUserMutate : AppUserListing {
        [DataMember(Name = "password")]
        public string Password { get; set; }
    }
}