// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TagRepository.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.Domain.Repositories {
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;

    public sealed  class TagRepository {
        private readonly DbContext _dbContext;
        private readonly DbSet<App.Models.Domain.Tag> _entitySet;

        public TagRepository(DbContext dbContext) {
            this._dbContext = dbContext;
            this._entitySet = dbContext.Set<App.Models.Domain.Tag>();
        }

        [CanBeNull]
        public App.Models.Domain.Tag FindById(int id) {
            return this._entitySet.Include(x => x.Owner).FirstOrDefault(x => x.Id == id);
        }

        [CanBeNull]
        public Task<App.Models.Domain.Tag> FindByIdAsync(int id) {
            return this._entitySet.Include(x => x.Owner).FirstOrDefaultAsync(x => x.Id == id);
        }

        [NotNull]
        public IQueryable<App.Models.Domain.Tag> GetAll() {
            return this._entitySet.Include(x => x.Owner);
        }

        
        [NotNull]
        public IQueryable<App.Models.Domain.Tag> GetByOwner(App.Models.Domain.AppOwner owner) {
            return this._entitySet.Where(x => x.Owner.Id == owner.Id).Include(x => x.Owner);
        }

        [NotNull]
        public IQueryable<App.Models.Domain.Tag> GetByOwner(int ownerId) {
            return this._entitySet.Where(x => x.Owner.Id == ownerId).Include(x => x.Owner);
        }

                

        public void Add(App.Models.Domain.Tag item) {
            this._entitySet.Add(item);
        }

        public void Delete(App.Models.Domain.Tag item) {
            if (item != null) {
                this._entitySet.Remove(item);
            }
        }

        public void DeleteById(int id) {
            App.Models.Domain.Tag item = this.FindById(id);
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
