// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppOwnerRepository.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Repositories {
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;

    public sealed class AppOwnerRepository {
        private readonly DbContext _dbContext;
        private readonly DbSet<AppOwner> _entitySet;

        public AppOwnerRepository(DbContext dbContext) {
            this._dbContext = dbContext;
            this._entitySet = dbContext.Set<AppOwner>();
        }

        [CanBeNull]
        public AppOwner FindById(int id) {
            return this._entitySet.FirstOrDefault(x => x.Id == id);
        }

        public Task<AppOwner> FindByIdAsync(int id) {
            return this._entitySet.FirstOrDefaultAsync(x => x.Id == id);
        }

        [NotNull]
        public IQueryable<AppOwner> GetAll() {
            return this._entitySet;
        }

        

        public void Add(AppOwner item) {
            this._entitySet.Add(item);
        }

        public void Delete(AppOwner item) {
            if (item != null) {
                this._entitySet.Remove(item);
            }
        }

        public void DeleteById(int id) {
            AppOwner item = this.FindById(id);
            if (item != null) {
                this._entitySet.Remove(item);
            }
        }

        public int SaveChanges() {
            return this._dbContext.SaveChanges();
        }

        public Task SaveChangesAsync() {
            return this._dbContext.SaveChangesAsync();
        }
    }
}
