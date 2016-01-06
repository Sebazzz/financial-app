namespace App.Models.Domain {
    using Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using Microsoft.Data.Entity;
    using Microsoft.Data.Entity.Infrastructure;
    using Microsoft.Data.Entity.Metadata;

    /// <summary>
    /// Represents the database context for the application
    /// </summary>
    public sealed class AppDbContext : IdentityDbContext<AppUser, AppRole, int> {
        public AppDbContext(DbContextOptions options) : base(options) {
            
        }

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
            modelBuilder.Entity<Sheet>()
                .HasOne(x => x.CalculationOptions)
                .WithOne()
                .HasForeignKey<CalculationOptions>(x => x.SheetId);

            //modelBuilder.Entity<SheetRecurringSheetEntry>()
            //    .HasOne(x => x.Template)
            //    .WithMany();

            //modelBuilder.Entity<SheetRecurringSheetEntry>()
            //    .HasOne(x => x.Sheet)
            //    .WithMany();

            modelBuilder.Entity<CalculationOptions>();
            
            modelBuilder.Entity<SheetEntry>()
                        .HasOne(x => x.Category)
                        .WithMany(x => x.SheetEntries)
                        .OnDelete(DeleteBehavior.Restrict);

            //modelBuilder.Entity<SheetEntry>()
            //            .HasOne(x => x.Template)
            //            .WithMany()
            //            .OnDelete(DeleteBehavior.SetNull);

            //modelBuilder.Entity<RecurringSheetEntry>()
            //            .HasOne(x => x.Category)
            //            .WithMany(x => x.RecurringSheetEntries)
            //            .OnDelete(DeleteBehavior.Restrict);
        }
    }
}