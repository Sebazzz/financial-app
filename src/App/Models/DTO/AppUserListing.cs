namespace App.Models.DTO {
    using System.Runtime.Serialization;

    [DataContract]
    public class AppUserListing {
        [DataMember]
        public string Email { get; set; }

        [DataMember]
        public string UserName { get; set; }

        [DataMember]
        public int Id { get; set; }
    }

    [DataContract]
    public class AppUserMutate : AppUserListing {
        [DataMember]
        public string NewPassword { get; set; }

        [DataMember]
        public string CurrentPassword { get; set; }
    }
}