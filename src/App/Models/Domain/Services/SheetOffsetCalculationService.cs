// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetOffsetCalculationService.cs
//  Project         : App
// ******************************************************************************
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

            // TODO: When Entity Framework properly supports 'select many from many', revert this query
            var q = (from entry in this._sheetRepository.GetOfSheetBeforeThreshold(ownerId, targetSheet.Subject)
                    select new {entry.Account, entry.Delta}).ToArray(); 
            
            var result = new CalculationOptions() {
                BankAccountOffset = targetSheet.CalculationOptions.BankAccountOffset ?? q.Where(x => x.Account == AccountType.BankAccount).Sum(x=>(decimal?)x.Delta).GetValueOrDefault(0),
                SavingsAccountOffset = targetSheet.CalculationOptions.SavingsAccountOffset ?? q.Where(x => x.Account == AccountType.SavingsAccount).Sum(x=>(decimal?)x.Delta).GetValueOrDefault(0)
            };

            return result;
        }
    }
}