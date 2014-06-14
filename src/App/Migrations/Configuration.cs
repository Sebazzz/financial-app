namespace App.Migrations {
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using Microsoft.AspNet.Identity;
    using Models.Domain;
    using Models.Domain.Identity;

    internal sealed class Configuration : DbMigrationsConfiguration<AppDbContext> {
        public Configuration() {
            this.AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(AppDbContext context) {
            if (!context.Set<AppOwner>().Any()) {
                SeedAccounts(context);
            }

            if (!context.Set<Category>().Any()) {
                SeedCategories(context);
            }
        }

        private static void SeedCategories(AppDbContext context) {
            context.Set<Category>()
                .Add(new Category {
                                      Name = "Category #1",
                                      Description = "Initial Category. Remove this.",
                                      Owner = context.Set<AppOwner>().First()
                                  });
            context.SaveChanges();
        }

        private static void SeedAccounts(AppDbContext context) {
            DbSet<AppOwner> appOwners = context.Set<AppOwner>();

            // add initial user
            var owner = new AppOwner("Initial");
            appOwners.Add(owner);

            AppUser user = AppUser.Create("User", "user@example.com", owner);
            var svc = new AppUserManager(new AppUserStore(context));
            svc.Create(user, "welcome01");

            context.SaveChanges();
        }
    }
}