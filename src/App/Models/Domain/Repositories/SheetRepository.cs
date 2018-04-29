namespace App.Models.Domain.Repositories {
    using System;
    using System.Collections.Generic;
    using Microsoft.EntityFrameworkCore;
    using System.Linq;

    partial class SheetRepository {
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

        public IEnumerable<SheetRecurringSheetEntry> GetTemplatesOfSheet(Sheet sheet) {
            return this._dbContext.Set<SheetRecurringSheetEntry>()
                                  .Where(x => x.Sheet.Id == sheet.Id)
                                  .Include(x => x.Template)
                                  .Include(x => x.Template.Category);
        }
    }
}