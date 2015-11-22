namespace App.Models.Domain {
    using Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using Microsoft.Data.Entity;
    using Microsoft.Data.Entity.Metadata;

    /// <summary>
    /// Represents the database context for the application
    /// </summary>
    public sealed class AppDbContext : IdentityDbContext<AppUser, AppRole, int> {
        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            base.OnModelCreating(modelBuilder);

            // categories
            modelBuilder.Entity<Category>();

            // owner groups
            modelBuilder.Entity<AppOwner>();

            // impersonation
            modelBuilder.Entity<AppUserTrustedUser>()
                        .ToTable("AppUserTrustedUsers");

            modelBuilder.Entity<AppUserTrustedUser>()
                        .HasOne(x => x.SourceUser)
                        .WithMany(x => x.TrustedUsers);

            modelBuilder.Entity<AppUserTrustedUser>()
                        .HasOne(x => x.TargetUser)
                        .WithMany();

            // sheet
            modelBuilder.Entity<Sheet>();
            modelBuilder.Entity<SheetEntry>()
                        .HasOne(x => x.Category)
                        .WithMany(x => x.SheetEntries)
                        .OnDelete(DeleteBehavior.Restrict);
        }
    }
}