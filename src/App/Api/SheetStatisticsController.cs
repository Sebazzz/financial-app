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
            this.EntityOwnerService.EnsureOwner(s, this.OwnerId);

            SheetGlobalStatistics stats = this._sheetStatisticsService.CalculateExpensesPerCategory(s);

            return new Report {
                Income = new ReportDigest {
                    Labels = stats.CategoryStatistics.Where(x => x.Delta > 0).Select(x => x.CategoryName).ToArray(),
                    DataSets = new[] {
                        new ReportDataSet {
                            Data = stats.CategoryStatistics.Where(x => x.Delta > 0).Select(x => x.Delta).ToArray(),
                            Label = "Data"
                        }
                    }
                },
                Expenses = new ReportDigest {
                    Labels = stats.CategoryStatistics.Where(x => x.Delta < 0).Select(x => x.CategoryName).ToArray(),
                    DataSets = new[] {
                        new ReportDataSet {
                            Data = stats.CategoryStatistics.Where(x => x.Delta < 0).Select(x => x.Delta * -1).ToArray(),
                            Label = "Data"
                        }
                    }
                }
            };
        }
    }
}