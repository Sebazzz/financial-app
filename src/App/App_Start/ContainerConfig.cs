namespace App {
    using System.Data.Entity;
    using System.Web;
    using System.Web.Http;
    using Microsoft.AspNet.Identity.Owin;
    using Microsoft.Owin;
    using Microsoft.Owin.Security;
    using Models.Domain;
    using Models.Domain.Identity;
    using Models.Domain.Repositories;
    using SimpleInjector;
    using SimpleInjector.Integration.WebApi;

    public static class ContainerConfig {
        internal static Container Container { get; private set; }

        public static void Configure() {
            Container = new Container();

            Container.Register(() => HttpContext.Current.GetOwinContext());
            Container.RegisterPerWebRequest(()=> Container.GetInstance<IOwinContext>().Authentication);
            Container.RegisterPerWebRequest(() => AppUserManager.Create(new IdentityFactoryOptions<AppUserManager>(), Container.GetInstance<IOwinContext>()));
            Container.RegisterPerWebRequest(AppDbContext.Create);
            Container.RegisterPerWebRequest<DbContext>(() => Container.GetInstance<AppDbContext>());

            RepositoryRegistry.InsertIn(Container);
        }

        public static void SetUpIntegration(HttpConfiguration configuration) {
            configuration.DependencyResolver = new SimpleInjectorWebApiDependencyResolver(Container);
        }
    }
}