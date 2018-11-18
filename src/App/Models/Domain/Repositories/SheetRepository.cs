// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetRepository.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Repositories {
    using System;
    using System.Collections.Generic;
    using Microsoft.EntityFrameworkCore;
    using System.Linq;
    using System.Threading.Tasks;

    public sealed class SheetRepository {
        private readonly DbContext _dbContext;
        private readonly DbSet<App.Models.Domain.Sheet> _entitySet;

        public SheetRepository(DbContext dbContext) {
            this._dbContext = dbContext;
            this._entitySet = dbContext.Set<App.Models.Domain.Sheet>();
        }

        [CanBeNull]
        public App.Models.Domain.Sheet FindById(int id) {
            return this._entitySet.FirstOrDefault(x => x.Id == id);
        }

        public Task<App.Models.Domain.Sheet> FindByIdAsync(int id) {
            return this._entitySet.FirstOrDefaultAsync(x => x.Id == id);
        }

        [NotNull]
        public IQueryable<App.Models.Domain.Sheet> GetAll() {
            return this._entitySet.Include(x => x.Owner);
        }

        
        [NotNull]
        public IQueryable<App.Models.Domain.Sheet> GetByOwner(App.Models.Domain.AppOwner owner) {
            return this._entitySet.Where(x => x.Owner.Id == owner.Id);
        }

        [NotNull]
        public IQueryable<App.Models.Domain.Sheet> GetByOwner(int ownerId) {
            return this._entitySet.Where(x => x.Owner.Id == ownerId);
        }

                

        public void Add(App.Models.Domain.Sheet item) {
            this._entitySet.Add(item);
        }

        public void Delete(App.Models.Domain.Sheet item) {
            if (item != null) {
                this._entitySet.Remove(item);
            }
        }

        public void DeleteById(int id) {
            App.Models.Domain.Sheet item = this.FindById(id);
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
        public void Add(CalculationOptions calculationOptions) {
            this._dbContext.Set<CalculationOptions>().Add(calculationOptions);
        }

        public IQueryable<Sheet> GetByDatePart(int month, int year, int appOwnerId) {
            var q = this._entitySet.Where(x => x.Subject.Month == month &&
                                                       x.Subject.Year == year &&
                                                       x.Owner.Id == appOwnerId);

            return q.Include(x => x.Entries);
        }

        public IQueryable<Sheet> FindByIdInclude(int id) {
            return this._entitySet.Where(x => x.Id == id).Include(x => x.Entries);
        }

        public IQueryable<SheetEntry> GetOfSheetBeforeThreshold(int ownerId, DateTime threshold) {
            return this._dbContext.Set<SheetEntry>()
                                  .Where(x => x.Sheet.Subject < threshold)
                                  .Where(x => x.Sheet.Owner.Id == ownerId);
        }

        public IQueryable<SheetEntry> GetOfSheet(Sheet sheet) {
            return this._dbContext.Set<SheetEntry>()
                                  .Where(x => x.Sheet.Id == sheet.Id)
                                  .Include(x => x.Category)
                                  .Include(x => x.Tags)
                                  .ThenInclude(x => x.Tag);
        }

        public IQueryable<SheetRecurringSheetEntry> GetTemplatesOfSheet(Sheet sheet) {
            return this._dbContext.Set<SheetRecurringSheetEntry>()
                                  .Where(x => x.Sheet.Id == sheet.Id)
                                  .Include(x => x.Template)
                                  .Include(x => x.Template.Category);
        }
    }
}
