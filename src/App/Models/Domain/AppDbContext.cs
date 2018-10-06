namespace App.Models.Domain {
    using Identity;
    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Design;
    using Microsoft.Extensions.Options;
    using Support;

    /// <summary>
    /// Represents the database context for the application
    /// </summary>
    public sealed class AppDbContext : IdentityDbContext<AppUser, AppRole, int> {
        private readonly DatabaseOptions _databaseOptions;

        public AppDbContext(IOptions<DatabaseOptions> databaseOptions) {
            this._databaseOptions = databaseOptions.Value;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) {
            base.OnConfiguring(optionsBuilder);

            optionsBuilder.UseSqlServer(this._databaseOptions.CreateConnectionString());
            optionsBuilder.UseLazyLoadingProxies();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            base.OnModelCreating(modelBuilder);

            // categories
            modelBuilder.Entity<Category>();

            // owner groups
            modelBuilder.Entity<AppOwner>();

            // users
            modelBuilder.Entity<AppUser>()
                        .OwnsOne(x => x.Preferences);

            // login event keeping
            modelBuilder.Entity<AppUserLoginEvent>();

            // direct data access
            modelBuilder.Entity<AppUser>()
                .HasOne(x => x.CurrentGroup)
                .WithMany(x => x.Users);

            modelBuilder.Entity<AppUser>()
                .HasMany(x => x.AvailableGroups)
                .WithOne(x => x.User)
                .HasForeignKey(x => x.UserId);

            modelBuilder.Entity<AppUserAvailableGroup>()
                .HasOne(x => x.Group)
                .WithMany()
                .HasForeignKey(x => x.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            // impersonation
            modelBuilder.Entity<AppUserTrustedUser>()
                        .ToTable("AppUserTrustedUsers");

            modelBuilder.Entity<AppUserTrustedUser>()
                        .HasOne(x => x.SourceUser)
                        .WithMany(x => x.AvailableImpersonations);

            modelBuilder.Entity<AppUserTrustedUser>()
                        .HasOne(x => x.TargetUser)
                        .WithMany();

            // sheet
            modelBuilder.Entity<Sheet>()
                .OwnsOne(x => x.CalculationOptions); // component

            modelBuilder.Entity<Sheet>()
                        .HasMany(x => x.ApplicableTemplates)
                        .WithOne(x => x.Sheet);

            modelBuilder.Entity<SheetRecurringSheetEntry>()
                .HasOne(x => x.Template)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);
            
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
            // TODO: Find way to de-dup connection string from appsettings.json
            string connString = "Server=(localdb)\\mssqllocaldb;Integrated Security=true;Database=financial_app;MultipleActiveResultSets=true";
            return new AppDbContext(new OptionsWrapper<DatabaseOptions>(new DatabaseOptions { ConnectionString = connString }));
        }
    }
}