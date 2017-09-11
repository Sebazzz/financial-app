namespace App.Models.DTO {
    using System.ComponentModel.DataAnnotations;

    public class AppUserListing {
        [Required(ErrorMessage = "Het e-mail adres is verplicht")]
        [RegularExpression("(.*)@(.*)", ErrorMessage = "Vul een geldig e-mail adres in")]
        public string Email { get; set; }

        [Required(ErrorMessage = "De gebruikersnaam is verplicht")]
        public string UserName { get; set; }

        public int Id { get; set; }
    }

    public class AppUserMutate : AppUserListing {
        public string NewPassword { get; set; }

        public string CurrentPassword { get; set; }
    }
}