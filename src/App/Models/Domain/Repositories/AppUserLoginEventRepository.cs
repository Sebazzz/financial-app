// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppUserLoginEventRepository.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Repositories {
    using System.Linq;
    using System.Threading.Tasks;
    using Identity;
    using Microsoft.EntityFrameworkCore;

    public sealed class AppUserLoginEventRepository {
        private readonly AppDbContext _appDbContext;

        public AppUserLoginEventRepository(AppDbContext appDbContext) {
            this._appDbContext = appDbContext;
        }

        public Task<AppUserLoginEvent> GetByKeyAsync(int userId, string ipAddress, string userAgent) {
            return this._appDbContext.Set<AppUserLoginEvent>().FirstOrDefaultAsync(x => x.IPAddress == ipAddress && x.UserId == userId && x.UserAgent == userAgent);
        }

        public IQueryable<AppUserLoginEvent> GetByUser(int userId) {
            return this._appDbContext.Set<AppUserLoginEvent>().Where(x => x.UserId == userId).OrderByDescending(x => x.Timestamp);
        }

        public void Add(AppUserLoginEvent loginEvent) {
            this._appDbContext.Set<AppUserLoginEvent>().Add(loginEvent);
        }

        public Task SaveChangesAsync() {
            return this._appDbContext.SaveChangesAsync();
        }
    }
}