// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppUserTrustedUserRepository.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Repositories {
    using System.Threading.Tasks;
    using Identity;

    public sealed class AppUserTrustedUserRepository {
        private readonly AppDbContext _appDbContext;

        public AppUserTrustedUserRepository(AppDbContext appDbContext) {
            this._appDbContext = appDbContext;
        }

        public void Add(AppUserTrustedUser availableImpersonation) {
            this._appDbContext.Set<AppUserTrustedUser>().Add(availableImpersonation);
        }

        public Task SaveChangesAsync() {
            return this._appDbContext.SaveChangesAsync();
        }

        public void Remove(AppUserTrustedUser availableImpersonation) {
            this._appDbContext.Set<AppUserTrustedUser>().Remove(availableImpersonation);
        }
    }
}