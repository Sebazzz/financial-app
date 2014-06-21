namespace App.Models.Domain.Repositories {
    using System.Linq;

    partial class SheetRepository {
        public IQueryable<Sheet> GetByDatePart(int month, int year, int appOwnerId) {
            var q = this._entitySet.Where(x => x.Subject.Month == month &&
                                                       x.Subject.Year == year &&
                                                       x.Owner.Id == appOwnerId);

            return q;
        }

        public IQueryable<Sheet> FindByIdInclude(int id) {
            return this._entitySet.Where(x => x.Id == id);
        }
    }
}