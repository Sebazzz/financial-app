namespace App.Models.Domain {
    using Identity;
    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Design;

    /// <summary>
    /// Represents the database context for the application
    /// </summary>
    public sealed class AppDbContext : IdentityDbContext<AppUser, AppRole, int> {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {     
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

            modelBuilder.Entity<SheetEntryTag>()
                        .HasOne(x => x.Tag)
                        .WithMany()
                        .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SheetEntryTag>()
                        .HasIndex(t => new {t.TagId, t.SheetEntryId})
                        .IsUnique();

            modelBuilder.Entity<SheetEntry>()
                        .HasMany(x => x.Tags)
                        .WithOne(x => x.SheetEntry);


        }
    }


    public sealed class AppDbContextDesignTimeFactory : IDesignTimeDbContextFactory<AppDbContext> {
        public AppDbContext CreateDbContext(string[] args) {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            // TODO: Find way to de-dup connection string from appsettings.json
            optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Integrated Security=true;Database=financial_app;MultipleActiveResultSets=true");
            return new AppDbContext(optionsBuilder.Options);
        }
    }
}