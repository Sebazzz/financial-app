// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppUserLoginEvent.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Identity {
    using System;
    using System.ComponentModel.DataAnnotations;

    public class AppUserLoginEvent {
        public int Id { get; set; }

        [Required]
        public string IPAddress { get; set; }

        [Required]
        public virtual AppUser User { get; set; }

        public int UserId { get; set; }

        [StringLength(4096)]
        public string UserAgent { get; set; }

        public DateTime Timestamp { get; set; }
    }
}