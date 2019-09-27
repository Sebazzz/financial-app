// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetStatisticsController.cs
//  Project         : App
// ******************************************************************************
using System.Collections.Generic;

namespace App.Api {
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Models.Domain;
    using Models.Domain.Services;

    using Support.Filters;

    [Authorize]
    [ReadOnlyApi]
    [Route("api/sheet/{sheetYear:int}-{sheetMonth:int}/statistics")]
    public class SheetStatisticsController : BaseEntityController {
        private readonly SheetRetrievalService _sheetRetrievalService;
        private readonly SheetStatisticsService _sheetStatisticsService;

        public SheetStatisticsController(EntityOwnerService entityOwnerService, SheetRetrievalService sheetRetrievalService, SheetStatisticsService sheetStatisticsService) : base(entityOwnerService) {
            this._sheetRetrievalService = sheetRetrievalService;
            this._sheetStatisticsService = sheetStatisticsService;
        }

        [HttpGet("")]
        public async Task<SheetGlobalStatistics> Get(int sheetMonth, int sheetYear) {
            Sheet s = await this._sheetRetrievalService.GetBySubjectAsync(sheetMonth, sheetYear, this.OwnerId);
            this.EntityOwnerService.EnsureOwner(s, this.OwnerId);

            return this._sheetStatisticsService.CalculateExpensesPerCategory(s);
        }

        [HttpGet("chart")]
        public async Task<Report> GetStats(int sheetMonth, int sheetYear) {
            Sheet s = await this._sheetRetrievalService.GetBySubjectAsync(sheetMonth, sheetYear, this.OwnerId);
            this.EntityOwnerService.EnsureOwner(s, this.OwnerId);

            DateTime previousSheetDate = s.Subject.AddMonths(-1);
            DateTime nextSheetDate = s.Subject.AddMonths(1);
            var sheet = new List<Sheet>(3);

            if (nextSheetDate < DateTime.Now) {
                sheet.Add(await this._sheetRetrievalService.GetBySubjectAsync(nextSheetDate.Month, nextSheetDate.Year, this.OwnerId));
            }
            sheet.Add(await this._sheetRetrievalService.GetBySubjectAsync(previousSheetDate.Month, previousSheetDate.Year, this.OwnerId));
            sheet.Add(await this._sheetRetrievalService.GetBySubjectAsync(sheetMonth, sheetYear, this.OwnerId));

            Sheet[] dataArray = sheet.ToArray();
            return new Report {
                Income = Create(dataArray, x => x > 0, x => x),
                Expenses = Create(dataArray, x => x < 0, x => x * -1) 
            };
        }

        private ReportDigest Create(Sheet[] sheets, Func<decimal, bool> filter, Func<decimal, decimal> transform) {
            var calculatedStats = new SheetGlobalStatistics[sheets.Length];
            for (int index = 0; index < sheets.Length; index++) {
                calculatedStats[index] = this._sheetStatisticsService.CalculateExpensesPerCategory(sheets[index]);
            }

            IEnumerable<SheetCategoryStatistics> catStats = Enumerable.Empty<SheetCategoryStatistics>();
            foreach (SheetGlobalStatistics item in calculatedStats) catStats = catStats.Union(item.CategoryStatistics);

            string[] categories = catStats
                .Where(x => filter(x.Delta))
                .Select(x => x.CategoryName)
                .Distinct()
                .OrderBy(x => x)
                .ToArray();

            decimal[] GetData(SheetGlobalStatistics dataSet, SheetGlobalStatistics[] otherDataSets) {
                // We want to get all statistics, if this category occurs in at least one of the other data sets
                return (
                    from category in categories
                    let delta = dataSet.CategoryStatistics.FirstOrDefault(x => x.CategoryName == category)?.Delta ?? 0
                    let existsInOtherDataSets = (
                        from otherDataSet in otherDataSets
                        let otherDelta = otherDataSet.CategoryStatistics.FirstOrDefault(x => x.CategoryName == category)?.Delta ?? 0
                        where filter(otherDelta)
                        select otherDelta
                    ).Any()
                    where filter(delta) || existsInOtherDataSets
                    select transform(delta)
                ).ToArray();
            }

            string GetLabel(SheetGlobalStatistics dataSet) {
                return dataSet.SheetSubject.ToString("MMM yyyy");
            }

            return new ReportDigest {
                Labels = categories,
                DataSets = (
                    from sheetStats in calculatedStats
                    let otherStats = calculatedStats.Where(x => x != sheetStats).ToArray()
                    orderby sheetStats.SheetSubject
                    select new ReportDataSet {
                        Data = GetData(sheetStats, otherStats),
                        Label = GetLabel(sheetStats)
                    }
                ).ToArray()
            };
        }
    }
}
