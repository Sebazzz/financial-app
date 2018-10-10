// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : RecurringSheetEntryRepository.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Repositories {
    using System.Linq;
    using Microsoft.EntityFrameworkCore;

    partial class RecurringSheetEntryRepository {
        public void ReplaceSortOrder(int ownerId, int oldSortOrder, int newSortOrder) {
            this._dbContext.Database.ExecuteSqlCommand(
                "UPDATE dbo.RecurringSheetEntry SET SortOrder = @p0 WHERE SortOrder = @p1 AND OwnerId = @p2",
                newSortOrder,
                oldSortOrder,
                ownerId);
        }

        public int FindNextSortOrder(int ownerId) {
            if (!this._entitySet.Any(x => x.Owner.Id == ownerId)) {
                return 1;
            }
            
            return this._entitySet.Where(x => x.Owner.Id == ownerId).Max(x => x.SortOrder) + 1;
        }
    }
}