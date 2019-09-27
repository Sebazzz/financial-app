// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetStatisticsService.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Services {
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Runtime.Serialization;
    using Repositories;

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

        public Report CalculateExpensesForAll(int ownerId) {
            List<SheetGlobalStatistics> statistics = this.QueryStatistics(this._sheetRepository.GetByOwner(ownerId)).ToList();

            DateTime[] dates = (
                from item in statistics
                group item by item.SheetSubject into g
                orderby g.Key
                select g.Key
                ).ToArray();

            string[] labels = (
                from date in dates
                select date.ToString("Y")).ToArray();

            var report = new Report {
                Expenses = new ReportDigest {
                    Labels = labels,
                    DataSets = GenerateDataSet(x => x.Delta < 0, x => -x, statistics, dates)
                },
                Income = new ReportDigest {
                    Labels = labels,
                    DataSets = GenerateDataSet(x => x.Delta > 0, x => x, statistics, dates)
                }
            };

            return report;
        }

        private static ReportDataSet[] GenerateDataSet(Func<SheetCategoryStatistics,bool> filter, Func<decimal,decimal> correction, List<SheetGlobalStatistics> statistics, DateTime[] dates) {
            string[] categories = (
                from item in statistics
                from catStats in item.CategoryStatistics
                where filter(catStats)
                select catStats.CategoryName
            ).Distinct().ToArray();

            return (
                from category in categories
                select new ReportDataSet {
                    Label = category,
                    Data = (
                        from date in dates
                        let sheet = statistics.Find(x => x.SheetSubject == date)
                        let categoryInfo = sheet?.CategoryStatistics.FirstOrDefault(x => x.CategoryName == category && filter(x))
                        select correction(categoryInfo?.Delta ?? 0M)
                    ).ToArray()
                }
            ).ToArray();
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

    public class Report {
        public ReportDigest Income { get; set; }
        public ReportDigest Expenses { get; set; }
    }

    public class ReportDigest {
        public string[] Labels { get;set; }

        public ReportDataSet[] DataSets { get; set; }
    }


    public class ReportDataSet {
        public string Label { get; set; }
        public decimal[] Data { get; set; }
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