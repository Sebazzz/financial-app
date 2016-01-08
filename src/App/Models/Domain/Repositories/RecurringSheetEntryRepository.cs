namespace App.Models.Domain.Repositories {
    using Microsoft.Data.Entity;

    partial class RecurringSheetEntryRepository {
        public void ReplaceSortOrder(int ownerId, int oldSortOrder, int newSortOrder) {
            this._dbContext.Database.ExecuteSqlCommand(
                "UPDATE dbo.RecurringSheetEntry SET SortOrder = @p0 WHERE SortOrder = @p1 AND OwnerId = @p2",
                newSortOrder,
                oldSortOrder,
                ownerId);
        }
    }
}