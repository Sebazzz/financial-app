// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetController.cs
//  Project         : App
// ******************************************************************************
namespace App.Api {
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    using AutoMapper;
    using Extensions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;

    using Models.DTO;
    using SheetDTO = Models.DTO.Sheet;
    using Sheet = Models.Domain.Sheet;
    using Models.Domain.Repositories;
    using Models.Domain.Services;

    using Support.Filters;
    using Support.Mapping;

    [Route("api/sheet")]
    public class SheetController : BaseEntityController {
        private readonly SheetRepository _sheetRepository;
        private readonly SheetRetrievalService _sheetRetrievalService;
        private readonly SheetStatisticsService _sheetStatisticsService;
        private readonly SheetLastVisitedMarkerService _sheetLastVisitedMarkerService;
        private readonly IMapper _mappingEngine;

        public SheetController(EntityOwnerService entityOwnerService, SheetRepository sheetRepository, SheetRetrievalService sheetRetrievalService, SheetStatisticsService sheetStatisticsService, IMapper mappingEngine, SheetLastVisitedMarkerService sheetLastVisitedMarkerService) : base(entityOwnerService) {
            this._sheetRepository = sheetRepository;
            this._sheetRetrievalService = sheetRetrievalService;
            this._sheetStatisticsService = sheetStatisticsService;
            this._mappingEngine = mappingEngine;
            this._sheetLastVisitedMarkerService = sheetLastVisitedMarkerService;
        }

        [HttpGet("{id}")]
        public async Task<SheetDTO> GetById(int id) {
            Sheet sheet = await this._sheetRepository.FindByIdInclude(id).FirstOrDefaultAsync().EnsureNotNull();

            sheet.Entries = new List<Models.Domain.SheetEntry>(this._sheetRepository.GetOfSheet(sheet));

            PreviousSheetVisitMarker marker = await this._sheetLastVisitedMarkerService.GetAndUpdateAsync(sheet, this.User.Identity.GetUserId());

            this.EntityOwnerService.EnsureOwner(sheet, this.OwnerId);
            SheetDTO dto = this._mappingEngine.Map<Sheet, SheetDTO>(sheet, m => m.SetPreviousSheetVisitMarker(marker));

            Array.Sort(dto.Entries, SortOrderComparer<SheetEntry>.Instance);

            return dto;
        }

        [HttpGet("statistics")]
        [ReadOnlyApi]
        public Report GetAllStatistics() {
            return this._sheetStatisticsService.CalculateExpensesForAll(this.OwnerId);
        }

        [HttpGet("{year:int:max(2100):min(2000)}-{month:int:max(12):min(1)}")]
        public async Task<SheetDTO> GetBySubject(int month, int year) {
            Sheet theSheet = await this._sheetRetrievalService.GetBySubjectAsync(month, year, this.OwnerId);

            PreviousSheetVisitMarker marker = await this._sheetLastVisitedMarkerService.GetAndUpdateAsync(theSheet, this.User.Identity.GetUserId());

            SheetDTO dto = this._mappingEngine.Map<Sheet, SheetDTO>(theSheet, opts => opts.SetPreviousSheetVisitMarker(marker));

            Array.Sort(dto.Entries, SortOrderComparer<SheetEntry>.Instance);
            return dto;
        }

        [HttpGet("{year:int:max(2100):min(2000)}-{month:int:max(12):min(1)}/source-autocompletion-data")]
        public string[] SourceAutoCompletionData(int month, int year) {
            HashSet<string> sources = new HashSet<string>(StringComparer.InvariantCultureIgnoreCase);

            sources.UnionWith(
                from sheet in this._sheetRepository.GetByDatePart(month, year, this.OwnerId)
                from sheetEntry in sheet.Entries
                select sheetEntry.Source
            );

            DateTime previousSheetDate = (new DateTime(year, month, 1)).AddMonths(-1);
            int previousMonth = previousSheetDate.Month, previousYear = previousSheetDate.Year;
            
            sources.UnionWith(
                from sheet in this._sheetRepository.GetByDatePart(previousMonth, previousYear, this.OwnerId)
                from sheetEntry in sheet.Entries
                select sheetEntry.Source
            );

            return sources.ToArray();
        }

        [HttpGet("")]
        public IEnumerable<SheetListing> GetAll() {
            IEnumerable<SheetListing> allSheets = this._sheetRetrievalService.GetAll(this.OwnerId);
            return allSheets.OrderByDescending(x => new DateTime(x.Year, x.Month, 1));
        }
    }
}
