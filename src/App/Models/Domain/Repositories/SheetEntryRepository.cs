namespace App.Models.Domain.Repositories {
    using Microsoft.Data.Entity;

    partial class SheetEntryRepository {
        public void ReplaceSortOrder(Sheet sheet, int oldSortOrder, int newSortOrder) {
            this._dbContext.Database.ExecuteSqlCommand(
                "UPDATE dbo.SheetEntry SET SortOrder = @p0 WHERE SortOrder = @p1 AND SheetId = @p2",
                newSortOrder,
                oldSortOrder,
                sheet.Id);
        }
    }
}