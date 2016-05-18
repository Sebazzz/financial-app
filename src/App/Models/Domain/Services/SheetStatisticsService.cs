namespace App.Models.Domain.Services {
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Linq;
    using System.Runtime.Serialization;
    using Repositories;
    using Microsoft.EntityFrameworkCore;

    public class SheetStatisticsService {
        private readonly SheetRepository _sheetRepository;
        private readonly SheetEntryRepository _sheetEntryRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public SheetStatisticsService(SheetRepository sheetRepository, SheetEntryRepository sheetEntryRepository) {
            this._sheetRepository = sheetRepository;
            this._sheetEntryRepository = sheetEntryRepository;
        }

        public SheetGlobalStatistics CalculateExpensesPerCategory(Sheet sheet) {
            int targetId = sheet.Id;
            IQueryable<Sheet> sheets = this._sheetRepository.FindByIdInclude(targetId);

            return this.QueryStatistics(sheets).FirstOrDefault();
        }


        public IEnumerable<SheetGlobalStatistics> CalculateExpensesForAll(int ownerId) {
            return this.QueryStatistics(this._sheetRepository.GetByOwner(ownerId));
        } 

        private IQueryable<SheetGlobalStatistics> QueryStatistics(IQueryable<Sheet> sheets) {
            // TODO: remove 'ToList()....' when EF properly supports this projection
            var q = from Sheet s in sheets.ToList().AsQueryable()
                    let entries = s.Entries
                    select new SheetGlobalStatistics {
                        Id = s.Id,
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

            // TODO: remove below method & call when EF supports this projection
            q = this.AddCategoryStatistics(q).AsQueryable();

            return q;
        }

        private IEnumerable<SheetGlobalStatistics> AddCategoryStatistics(IQueryable<SheetGlobalStatistics> sheetGlobalStatisticses) {
            var allEntries = this._sheetEntryRepository.GetAll().AsEnumerable().ToLookup(x => x.Sheet.Id, s => s);

            foreach (SheetGlobalStatistics globalStatistics in sheetGlobalStatisticses) {
                var entries = allEntries[globalStatistics.Id];

                globalStatistics.CategoryStatistics = from entry in entries
                                             group entry by entry.Category into g
                                             select new SheetCategoryStatistics {
                                                 CategoryName = g.Key.Name,
                                                 Delta = g.Sum(x => x.Delta)
                                             };

                yield return globalStatistics;
            }
        }
    }

    [DataContract]
    public class SheetGlobalStatistics {
        [DataMember]
        public decimal TotalExpenses { get; set; }

        [DataMember]
        public decimal TotalSavings { get; set; }

        [DataMember]
        public decimal TotalIncome { get; set; }

        [DataMember]
        public DateTime SheetSubject { get; set; }

        [DataMember]
        public IEnumerable<SheetCategoryStatistics> CategoryStatistics { get; set; }

        [IgnoreDataMember]
        public int Id { get; set; }
    }

    [DataContract]
    public class SheetCategoryStatistics {
        [DataMember]
        public string CategoryName { get; set; }

        [DataMember]
        public decimal Delta { get; set; }
    }
}