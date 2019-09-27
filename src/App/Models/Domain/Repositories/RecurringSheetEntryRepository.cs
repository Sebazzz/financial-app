// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : RecurringSheetEntryRepository.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Repositories {
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;

    public sealed class RecurringSheetEntryRepository {
        private readonly DbContext _dbContext;
        private readonly DbSet<App.Models.Domain.RecurringSheetEntry> _entitySet;

        public RecurringSheetEntryRepository(DbContext dbContext) {
            this._dbContext = dbContext;
            this._entitySet = dbContext.Set<App.Models.Domain.RecurringSheetEntry>();
        }

        [CanBeNull]
        public App.Models.Domain.RecurringSheetEntry FindById(int id) {
            return this._entitySet.Where(x => x.Id == id).Include(x => x.Category).Include(x => x.Owner).FirstOrDefault();
        }

        public Task<App.Models.Domain.RecurringSheetEntry> FindByIdAsync(int id) {
            return this._entitySet.Where(x => x.Id == id).Include(x => x.Category).Include(x => x.Owner).FirstOrDefaultAsync();
        }

        [NotNull]
        public IQueryable<App.Models.Domain.RecurringSheetEntry> GetAll() {
            return this._entitySet.Include(x => x.Category);
        }

        

        public void Add(App.Models.Domain.RecurringSheetEntry item) {
            this._entitySet.Add(item);
        }

        public void Delete(App.Models.Domain.RecurringSheetEntry item) {
            if (item != null) {
                this._dbContext.Database.ExecuteSqlInterpolated($"UPDATE dbo.SheetEntry SET TemplateId = NULL WHERE TemplateId = {item.Id}");
                this._entitySet.Remove(item);
            }
        }

        public void DeleteById(int id) {
            App.Models.Domain.RecurringSheetEntry item = this.FindById(id);
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

        public IEnumerable<RecurringSheetEntry> GetByOwner(int ownerId) {
            return this._entitySet.Where(x => x.Owner.Id == ownerId);
        }
        public void ReplaceSortOrder(int ownerId, int oldSortOrder, int newSortOrder) {
            this._dbContext.Database.ExecuteSqlInterpolated($"UPDATE dbo.RecurringSheetEntry SET SortOrder = {newSortOrder} WHERE SortOrder = {oldSortOrder} AND OwnerId = {ownerId}");
        }

        public int FindNextSortOrder(int ownerId) {
            if (!this._entitySet.Any(x => x.Owner.Id == ownerId)) {
                return 1;
            }
            
            return this._entitySet.Where(x => x.Owner.Id == ownerId).Max(x => x.SortOrder) + 1;
        }
    }
}
