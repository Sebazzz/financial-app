namespace App.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using Models.Domain;
    using Models.Domain.Identity;

    internal sealed class Configuration : DbMigrationsConfiguration<App.Models.Domain.AppDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(App.Models.Domain.AppDbContext context)
        {
            if (!context.Set<AppOwner>().Any()) {
                this.SeedAccounts(context);
            }
        }

        private void SeedAccounts(AppDbContext context) {
            var appOwners = context.Set<AppOwner>();

            AppOwner owner = new AppOwner("Initial");

            AppUser user = AppUser.Create("User", "user@example.com", owner);
            appOwners.Add(owner);
            context.Users.Add(user);
        }
    }
}
