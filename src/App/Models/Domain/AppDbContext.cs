namespace App.Models.Domain {
    using System.Data.Entity;
    using Identity;
    using Microsoft.AspNet.Identity.EntityFramework;

    /// <summary>
    /// Represents the database context for the application
    /// </summary>
    public sealed class AppDbContext : IdentityDbContext<AppUser, AppRole, int, AppUserLogin, AppUserRole, AppUserClaim> {
        /// <summary>
        /// Constructs a new context instance using conventions to create the name of the database to
        ///             which a connection will be made.  The by-convention name is the full name (namespace + class name)
        ///             of the derived context class.
        ///             See the class remarks for how this is used to create a connection.
        /// </summary>
        public AppDbContext() : base("AppConnection") {}

        /// <summary>
        /// Constructs a new context instance using the given string as the name or connection string for the
        ///             database to which a connection will be made.
        ///             See the class remarks for how this is used to create a connection.
        /// </summary>
        /// <param name="nameOrConnectionString">Either the database name or a connection string. </param>
        public AppDbContext(string nameOrConnectionString) : base(nameOrConnectionString) {}

        /// <summary>
        /// Creates a new instance of <see cref="AppDbContext"/>
        /// </summary>
        /// <returns></returns>
        public static AppDbContext Create() {
            return new AppDbContext("AppConnection");
        }


        /// <summary>
        /// This method is called when the model for a derived context has been initialized, but
        ///             before the model has been locked down and used to initialize the context.  The default
        ///             implementation of this method does nothing, but it can be overridden in a derived class
        ///             such that the model can be further configured before it is locked down.
        /// </summary>
        /// <remarks>
        /// Typically, this method is called only once when the first instance of a derived context
        ///             is created.  The model for that context is then cached and is for all further instances of
        ///             the context in the app domain.  This caching can be disabled by setting the ModelCaching
        ///             property on the given ModelBuidler, but note that this can seriously degrade performance.
        ///             More control over caching is provided through use of the DbModelBuilder and DbContextFactory
        ///             classes directly.
        /// </remarks>
        /// <param name="modelBuilder">The builder that defines the model for the context being created. </param>
        protected override void OnModelCreating(DbModelBuilder modelBuilder) {
            base.OnModelCreating(modelBuilder);

            // categories
            modelBuilder.Entity<Category>();

            // owner groups
            modelBuilder.Entity<AppOwner>();

            // impersonation
            modelBuilder.Entity<AppUser>()
                        .HasMany(x => x.TrustedUsers)
                        .WithMany()
                        .Map(m => m.ToTable("AppUserTrustedUsers").MapLeftKey("SourceUser").MapRightKey("TargetUser"));

            // sheet
            modelBuilder.Entity<Sheet>();
            modelBuilder.Entity<SheetEntry>()
                        .HasRequired(x => x.Category)
                        .WithMany(x => x.SheetEntries)
                        .WillCascadeOnDelete(false);
        }
    }
}