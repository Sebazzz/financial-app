// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetEntryRepository.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Repositories {
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;

    public sealed class SheetEntryRepository {
        private readonly DbContext _dbContext;
        private readonly DbSet<App.Models.Domain.SheetEntry> _entitySet;

        public SheetEntryRepository(DbContext dbContext) {
            this._dbContext = dbContext;
            this._entitySet = dbContext.Set<App.Models.Domain.SheetEntry>();
        }

        [CanBeNull]
        public App.Models.Domain.SheetEntry FindById(int id) {
            return this._entitySet.Where(x => x.Id == id).Include(x => x.Tags).ThenInclude(x => x.Tag).Include(x => x.Sheet).Include(x => x.Sheet.Owner).Include(x => x.Category).FirstOrDefault();
        }

        public Task<App.Models.Domain.SheetEntry> FindByIdAsync(int id) {
            return this._entitySet.FirstOrDefaultAsync(x => x.Id == id);
        }

        [NotNull]
        public IQueryable<App.Models.Domain.SheetEntry> GetAll() {
            return this._entitySet.Include(x => x.Sheet).Include(x => x.Category);
        }

        

        public void Add(App.Models.Domain.SheetEntry item) {
            this._entitySet.Add(item);
        }

        public void Delete(App.Models.Domain.SheetEntry item) {
            if (item != null) {
                this._entitySet.Remove(item);
            }
        }

        public void DeleteById(int id) {
            App.Models.Domain.SheetEntry item = this.FindById(id);
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

        public void ReplaceSortOrder(Sheet sheet, int oldSortOrder, int newSortOrder) {
            this._dbContext.Database.ExecuteSqlCommand(
                "UPDATE dbo.SheetEntry SET SortOrder = @p0 WHERE SortOrder = @p1 AND SheetId = @p2",
                newSortOrder,
                oldSortOrder,
                sheet.Id);
        }
    }
}
