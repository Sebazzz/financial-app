namespace App.Api {
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using AutoMapper;
    using Extensions;
    using Microsoft.AspNetCore.Mvc;
    using Models.DTO;
    using SheetDTO = Models.DTO.Sheet;
    using Sheet = Models.Domain.Sheet;
    using Models.Domain.Repositories;
    using Models.Domain.Services;

    [Route("api/sheet")]
    public class SheetController : BaseEntityController {
        private readonly SheetRepository _sheetRepository;
        private readonly SheetRetrievalService _sheetRetrievalService;
        private readonly SheetStatisticsService _sheetStatisticsService;
        private readonly IMapper _mappingEngine;

        public SheetController(EntityOwnerService entityOwnerService, SheetRepository sheetRepository, SheetRetrievalService sheetRetrievalService, SheetStatisticsService sheetStatisticsService, IMapper mappingEngine) : base(entityOwnerService) {
            this._sheetRepository = sheetRepository;
            this._sheetRetrievalService = sheetRetrievalService;
            this._sheetStatisticsService = sheetStatisticsService;
            this._mappingEngine = mappingEngine;
        }

        [HttpGet("{id}")]
        public SheetDTO GetById(int id) {
            Sheet sheet = this._sheetRepository.FindByIdInclude(id)
                                               .FirstOrDefault();
            sheet.EnsureNotNull();

            sheet.Entries = new List<Models.Domain.SheetEntry>(this._sheetRepository.GetOfSheet(sheet));

            this.EntityOwnerService.EnsureOwner(sheet, this.OwnerId);
            var dto = this._mappingEngine.Map<Sheet, SheetDTO>(sheet);

            Array.Sort(dto.Entries, SortOrderComparer<SheetEntry>.Instance);

            return dto;
        }

        [HttpGet("statistics")]
        public IEnumerable<SheetGlobalStatistics> GetAllStatistics() {
            return this._sheetStatisticsService.CalculateExpensesForAll(this.OwnerId).OrderBy(x => x.SheetSubject);
        }

        [HttpGet("{year:int:max(2100):min(2000)}-{month:int:max(12):min(1)}")]
        public SheetDTO GetBySubject(int month, int year) {
            Sheet theSheet = this._sheetRetrievalService.GetBySubject(month, year, this.OwnerId);
            var dto = this._mappingEngine.Map<Sheet, SheetDTO>(theSheet);

            Array.Sort(dto.Entries, SortOrderComparer<SheetEntry>.Instance);
            return dto;
        }

        [HttpGet("")]
        public IEnumerable<SheetListing> GetAll() {
            IEnumerable<SheetListing> allSheets = this._sheetRetrievalService.GetAll(this.OwnerId);
            return allSheets.OrderByDescending(x => new DateTime(x.Year, x.Month, 1));
        }
    }
}