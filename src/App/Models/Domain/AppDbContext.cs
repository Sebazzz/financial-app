namespace App.Models.Domain {
    using Identity;
    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Microsoft.EntityFrameworkCore.Internal;
    using Microsoft.EntityFrameworkCore.Metadata;

    /// <summary>
    /// Represents the database context for the application
    /// </summary>
    public sealed class AppDbContext : IdentityDbContext<AppUser, AppRole, int> {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {
            
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            base.OnModelCreating(modelBuilder);

            foreach (var entity in modelBuilder.Model.GetEntityTypes()) {
                entity.Relational().TableName = entity.Name;
            }

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
            modelBuilder.Entity<Sheet>()
                .HasOne(x => x.CalculationOptions)
                .WithOne()
                .HasForeignKey<CalculationOptions>(x => x.SheetId);

            modelBuilder.Entity<Sheet>()
                        .HasMany(x => x.ApplicableTemplates)
                        .WithOne(x => x.Sheet);

            modelBuilder.Entity<SheetRecurringSheetEntry>()
                .HasOne(x => x.Template)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CalculationOptions>();
            
            modelBuilder.Entity<SheetEntry>()
                        .HasOne(x => x.Category)
                        .WithMany(x => x.SheetEntries)
                        .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SheetEntry>()
                        .HasOne(x => x.Template)
                        .WithMany()
                        .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RecurringSheetEntry>()
                        .HasOne(x => x.Category)
                        .WithMany(x => x.RecurringSheetEntries)
                        .OnDelete(DeleteBehavior.Restrict);
        }
    }
}