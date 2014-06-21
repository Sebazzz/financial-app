namespace App.Models.Domain.Services {
    using System.Linq;
    using Repositories;

    public class SheetOffsetCalculationService {
        private readonly SheetRepository _sheetRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public SheetOffsetCalculationService(SheetRepository sheetRepository) {
            this._sheetRepository = sheetRepository;
        }

        /// <summary>
        /// Calculates the offset of the sheet based on previous sheets
        /// </summary>
        /// <returns></returns>
        public CalculationOptions CalculateOffset(Sheet targetSheet) {
            int ownerId = targetSheet.Owner.Id;

            var q = (from Sheet s in this._sheetRepository.GetByOwner(ownerId)
                    where s.Subject < targetSheet.Subject
                    from SheetEntry entry in s.Entries
                    select new {entry.Account, entry.Delta}).ToArray(); 

            return new CalculationOptions() {
                BankAccountOffset = q.Where(x => x.Account == AccountType.BankAccount).Sum(x=>(decimal?)x.Delta).GetValueOrDefault(0),
                SavingsAccountOffset = q.Where(x => x.Account == AccountType.SavingsAccount).Sum(x=>(decimal?)x.Delta).GetValueOrDefault(0)
            };
        }
    }
}