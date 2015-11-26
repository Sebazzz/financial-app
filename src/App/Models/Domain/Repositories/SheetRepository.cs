namespace App.Models.Domain.Repositories {
    using System;
    using Microsoft.Data.Entity;
    using System.Linq;

    partial class SheetRepository {
        public IQueryable<Sheet> GetByDatePart(int month, int year, int appOwnerId) {
            var q = this._entitySet.Where(x => x.Subject.Month == month &&
                                                       x.Subject.Year == year &&
                                                       x.Owner.Id == appOwnerId);

            return q.Include(x => x.CalculationOptions).Include(x => x.Entries);
        }

        public IQueryable<Sheet> FindByIdInclude(int id) {
            return this._entitySet.Where(x => x.Id == id).Include(x => x.CalculationOptions).Include(x => x.Entries);
        }

        public IQueryable<SheetEntry> GetOfSheetBeforeThreshold(int ownerId, DateTime threshold) {
            return this._dbContext.Set<SheetEntry>()
                                  .Where(x => x.Sheet.Subject < threshold)
                                  .Where(x => x.Sheet.Owner.Id == ownerId);
        }
    }
}