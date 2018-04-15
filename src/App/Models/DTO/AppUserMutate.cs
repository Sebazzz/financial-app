namespace App.Models.DTO {
    public class AppUserMutate : AppUserListing {
        public string NewPassword { get; set; }

        public string CurrentPassword { get; set; }
    }
}