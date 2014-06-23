namespace App.Models.Domain.Services {
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Linq;
    using System.Runtime.Serialization;
    using Repositories;

    public class SheetStatisticsService {
        private readonly SheetRepository _sheetRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public SheetStatisticsService(SheetRepository sheetRepository) {
            this._sheetRepository = sheetRepository;
        }

        public SheetGlobalStatistics CalculateExpensesPerCategory(Sheet sheet) {
            int targetId = sheet.Id;
            IQueryable<Sheet> sheets = this._sheetRepository.FindByIdInclude(targetId);

            return QueryStatistics(sheets).FirstOrDefault();
        }

        private static IQueryable<SheetGlobalStatistics> QueryStatistics(IQueryable<Sheet> sheets) {
            var q = from Sheet s in sheets
                    let entries = s.Entries
                    select new SheetGlobalStatistics {
                        SheetSubject = s.Subject,
                        TotalExpenses = entries.Where(x => x.Account == AccountType.BankAccount && x.Delta < 0).Sum(x => (decimal?)x.Delta * -1) ?? 0,
                        TotalIncome = entries.Where(x => x.Account == AccountType.BankAccount && x.Delta > 0).Sum(x => (decimal?)x.Delta) ?? 0,
                        TotalSavings = entries.Where(x => x.Account == AccountType.SavingsAccount && x.Delta > 0).Sum(x => (decimal?)x.Delta) ?? 0,
                        CategoryStatistics = from entry in entries
                                             group entry by entry.Category into g
                                             select new SheetCategoryStatistics {
                                                 CategoryName = g.Key.Name,
                                                 Delta = g.Sum(x => x.Delta)
                                             }
                    };

            return q;
        } 
    }

    [DataContract]
    public class SheetGlobalStatistics {
        [DataMember(Name = "totalExpenses")]
        public decimal TotalExpenses { get; set; }

        [DataMember(Name = "totalSavings")]
        public decimal TotalSavings { get; set; }

        [DataMember(Name = "totalIncome")]
        public decimal TotalIncome { get; set; }

        [DataMember(Name = "sheetSubject")]
        public DateTime SheetSubject { get; set; }

        [DataMember(Name = "categoryStatistics")]
        public IEnumerable<SheetCategoryStatistics> CategoryStatistics { get; set; }
    }

    [DataContract]
    public class SheetCategoryStatistics {
        [DataMember(Name = "categoryName")]
        public string CategoryName { get; set; }

        [DataMember(Name = "delta")]
        public decimal Delta { get; set; }
    }
}