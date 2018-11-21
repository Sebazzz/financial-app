// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : CategoryRepository.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Repositories {
    using System.Linq;
    using System.Threading.Tasks;
    using DTO;
    using Microsoft.EntityFrameworkCore;

    public sealed class CategoryRepository {
        private readonly DbContext _dbContext;
        private readonly DbSet<App.Models.Domain.Category> _entitySet;

        public CategoryRepository(DbContext dbContext) {
            this._dbContext = dbContext;
            this._entitySet = dbContext.Set<App.Models.Domain.Category>();
        }

        [CanBeNull]
        public App.Models.Domain.Category FindById(int id) {
            return this._entitySet.FirstOrDefault(x => x.Id == id);
        }

        [CanBeNull]
        public Task<App.Models.Domain.Category> FindByIdAsync(int id) {
            return this._entitySet.FirstOrDefaultAsync(x => x.Id == id);
        }

        [NotNull]
        public IQueryable<App.Models.Domain.Category> GetAll() {
            return this._entitySet.Include(x => x.Owner);
        }

        [NotNull]
        public IQueryable<App.Models.Domain.Category> GetByOwner(int ownerId) {
            return this._entitySet.Where(x => x.Owner.Id == ownerId).Include(x => x.Owner);
        }

        public IQueryable<CategoryListing> GetListingByOwner(int ownerId)
        {
            DbSet<Domain.SheetEntry> sheetEntries = this._dbContext.Set<Domain.SheetEntry>();
            DbSet<Domain.RecurringSheetEntry> recurringSheetEntries = this._dbContext.Set<Domain.RecurringSheetEntry>();

            return this._entitySet
                .Where(x => x.Owner.Id == ownerId)
                .Select(x => new CategoryListing
            {
                Description = x.Description,
                Name = x.Name,
                Id = x.Id,
                CanBeDeleted = !(sheetEntries.Any(entry => entry.Category.Id == x.Id) || recurringSheetEntries.Any(entry => entry.Category.Id == x.Id))
            });
        }
                

        public void Add(App.Models.Domain.Category item) {
            this._entitySet.Add(item);
        }

        public void Delete(App.Models.Domain.Category item) {
            if (item != null) {
                this._entitySet.Remove(item);
            }
        }

        public void DeleteById(int id) {
            App.Models.Domain.Category item = this.FindById(id);
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
