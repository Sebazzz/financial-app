namespace App.Api {
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

        [Route("")]
        [HttpGet]
        public SheetGlobalStatistics Get(int sheetMonth, int sheetYear) {
            Sheet s = this._sheetRetrievalService.GetBySubject(sheetMonth, sheetYear, this.OwnerId);
            this.EntityOwnerService.EnsureOwner(s, this.OwnerId);

            return this._sheetStatisticsService.CalculateExpensesPerCategory(s);
        }
    }
}