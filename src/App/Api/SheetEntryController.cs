namespace App.Api {
    using System;
    using System.Diagnostics;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using Extensions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Routing;
    using Microsoft.EntityFrameworkCore;

    using Models.Domain.Repositories;
    using Models.Domain.Services;
    using Sheet = Models.Domain.Sheet;
    using SheetEntry = Models.Domain.SheetEntry;
    using SheetEntryDTO=Models.DTO.SheetEntry;

    [Authorize]
    [Route("api/sheet/{sheetYear:int}-{sheetMonth:int}/entries")]
    public class SheetEntryController : BaseEntityController {
        private readonly SheetEntryRepository _sheetEntryRepository;
        private readonly SheetRetrievalService _sheetRetrievalService;
        private readonly IMapper _mappingEngine;

        public SheetEntryController(EntityOwnerService entityOwnerService, SheetEntryRepository sheetEntryRepository, SheetRetrievalService sheetRetrievalService, IMapper mappingEngine) : base(entityOwnerService) {
            this._sheetEntryRepository = sheetEntryRepository;
            this._sheetRetrievalService = sheetRetrievalService;
            this._mappingEngine = mappingEngine;
        }

        // GET: api/sheet/1/entries/1
        [HttpGet("{id}", Name = "SheetEntry-Get")]
        public SheetEntryDTO Get(int id) {
            SheetEntry entry = this._sheetEntryRepository.FindById(id).EnsureNotNull();
            this.EnsureCorrectSheet(entry);

            return this._mappingEngine.Map<SheetEntryDTO>(entry);
        }

        [HttpPost("{id}/order/{mutation}")]
        public async Task<IActionResult> MutateOrder(int id, SortOrderMutationType mutation) {
            int delta = (int) mutation;

            SheetEntry entry = await this.GetByIdAsync(id);
            Trace.Assert(entry.Category != null);

            entry.Sheet.UpdateTimestamp = DateTime.Now;
            entry.SortOrder += delta;

            this._sheetEntryRepository.ReplaceSortOrder(entry.Sheet, entry.SortOrder, entry.SortOrder - delta);
            await this._sheetEntryRepository.SaveChangesAsync();

            return this.NoContent();
        }

        public enum SortOrderMutationType {
            Increase = 1,
            Decrease = -1
        }

        // POST: api/sheet/2014-10/entries
        [HttpPost("")]
        public async Task<IActionResult> Post(int sheetYear, int sheetMonth, [FromBody] SheetEntryDTO value) {
            Sheet targetSheet = this._sheetRetrievalService.GetBySubject(sheetMonth, sheetYear, this.OwnerId).EnsureNotNull();
            this.EntityOwnerService.EnsureOwner(targetSheet, this.OwnerId);

            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            SheetEntry entry = this._mappingEngine.Map<SheetEntryDTO, SheetEntry>(value);
            entry.Sheet = targetSheet;
            entry.CreateTimestamp = DateTime.Now;
            entry.UpdateTimestamp = entry.CreateTimestamp;
            entry.Sheet.UpdateTimestamp = DateTime.Now;
            entry.SortOrder = targetSheet.Entries.Max(x => (int?) x.SortOrder).GetValueOrDefault() + 1;

            this._sheetEntryRepository.Add(entry);
            await this._sheetEntryRepository.SaveChangesAsync();

            return this.CreatedAtRoute("SheetEntry-Get", new {id = value.Id}, this.Get(entry.Id));
        }

        // PUT: api/sheet/2014-10/entries
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Put(int id, [FromBody] SheetEntryDTO value) {
            SheetEntry entry = await this.GetByIdAsync(id);

            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            this._mappingEngine.Map(value, entry);
            entry.UpdateTimestamp = DateTime.Now;
            entry.Sheet.UpdateTimestamp = DateTime.Now;

            await this._sheetEntryRepository.SaveChangesAsync();

            return this.NoContent();
        }

        // DELETE: api/sheet/2014-11/entries
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id) {
            SheetEntry entry = await this.GetByIdAsync(id);
            entry.Sheet.UpdateTimestamp = DateTime.Now;

            this._sheetEntryRepository.Delete(entry);
            await this._sheetEntryRepository.SaveChangesAsync();

            return this.NoContent();
        }

        private void EnsureCorrectSheet(SheetEntry sheetEntry) {
            RouteData routeData = this.RouteData;

            int sheetMonth = Convert.ToInt32(routeData.Values["sheetMonth"]);
            int sheetYear = Convert.ToInt32(routeData.Values["sheetYear"]);

            if (sheetEntry.Sheet.Subject.Month != sheetMonth || sheetEntry.Sheet.Subject.Year != sheetYear) {
                throw new HttpStatusException(HttpStatusCode.BadRequest);
            }
        }

        private async Task<SheetEntry> GetByIdAsync(int id) {
            SheetEntry entry = await this._sheetEntryRepository.GetAll().Include(x => x.Sheet).Include(x => x.Sheet.Owner).Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id).EnsureNotNull();
            this.EnsureCorrectSheet(entry);
            this.EntityOwnerService.EnsureOwner(entry.Sheet, this.OwnerId);
            return entry;
        }
    }
}