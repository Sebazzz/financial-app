namespace App.Api {
    using System;
    using System.Linq;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Models.Domain;
    using Models.Domain.Services;

    [Authorize]
    [Route("api/sheet/{sheetYear:int}-{sheetMonth:int}/statistics")]
    public class SheetStatisticsController : BaseEntityController {
        private readonly SheetRetrievalService _sheetRetrievalService;
        private readonly SheetStatisticsService _sheetStatisticsService;

        public SheetStatisticsController(EntityOwnerService entityOwnerService, SheetRetrievalService sheetRetrievalService, SheetStatisticsService sheetStatisticsService) : base(entityOwnerService) {
            this._sheetRetrievalService = sheetRetrievalService;
            this._sheetStatisticsService = sheetStatisticsService;
        }

        [HttpGet("")]
        public SheetGlobalStatistics Get(int sheetMonth, int sheetYear) {
            Sheet s = this._sheetRetrievalService.GetBySubject(sheetMonth, sheetYear, this.OwnerId);
            this.EntityOwnerService.EnsureOwner(s, this.OwnerId);

            return this._sheetStatisticsService.CalculateExpensesPerCategory(s);
        }

        [HttpGet("chart")]
        public Report GetStats(int sheetMonth, int sheetYear) {
            Sheet s = this._sheetRetrievalService.GetBySubject(sheetMonth, sheetYear, this.OwnerId);

            DateTime previousSheetDate = s.Subject.AddMonths(-1);
            Sheet ps = this._sheetRetrievalService.GetBySubject(previousSheetDate.Month, previousSheetDate.Year, this.OwnerId);
            this.EntityOwnerService.EnsureOwner(s, this.OwnerId);

            SheetGlobalStatistics pstats = this._sheetStatisticsService.CalculateExpensesPerCategory(ps);
            SheetGlobalStatistics stats = this._sheetStatisticsService.CalculateExpensesPerCategory(s);

            return new Report {
                Income = Create(pstats, stats, x => x > 0, x => x),
                Expenses = Create(pstats, stats, x => x < 0, x => x * -1) 
            };
        }

        private ReportDigest Create(SheetGlobalStatistics oneMonth, SheetGlobalStatistics otherMonth, Func<decimal, bool> filter, Func<decimal, decimal> transform) {
            string[] categories = oneMonth.CategoryStatistics.Union(otherMonth.CategoryStatistics)
                .Where(x => filter(x.Delta))
                .Select(x => x.CategoryName)
                .Distinct()
                .OrderBy(x => x)
                .ToArray();

            decimal[] GetData(SheetGlobalStatistics dataSet, SheetGlobalStatistics otherDataSet) {
                return (
                    from category in categories
                    let delta = dataSet.CategoryStatistics.FirstOrDefault(x => x.CategoryName == category)?.Delta ?? 0
                    let otherDelta = otherDataSet.CategoryStatistics.FirstOrDefault(x => x.CategoryName == category)?.Delta ?? 0
                    where filter(delta) || filter(otherDelta)
                    select transform(delta)
                ).ToArray();
            }

            string GetLabel(SheetGlobalStatistics dataSet) {
                return dataSet.SheetSubject.ToString("MMM yyyy");
            }

            return new ReportDigest {
                Labels = categories,
                DataSets = new[] {
                    new ReportDataSet {
                        Data = GetData(oneMonth, otherMonth),
                        Label = GetLabel(oneMonth)
                    },
                    new ReportDataSet {
                        Data = GetData(otherMonth, oneMonth),
                        Label = GetLabel(otherMonth)
                    }
                }
            };
        }
    }
}