// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : RecurringSheetEntryController.cs
//  Project         : App
// ******************************************************************************
namespace App.Api {
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Linq;
    using System.Threading.Tasks;

    using AutoMapper;
    using Extensions;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Models.Domain.Repositories;
    using Models.Domain.Services;
    using Models.DTO;

    using Support.Filters;

    using RecurringSheetEntry = Models.Domain.RecurringSheetEntry;
    using RecurringSheetEntryDTO=Models.DTO.RecurringSheetEntry;

    [Authorize]
    [Route("api/sheetentry-recurring")]
    public sealed class RecurringSheetEntryController : BaseEntityController {
        private readonly IMapper _mappingEngine;
        private readonly RecurringSheetEntryRepository _recurringSheetEntryRepository;

        public RecurringSheetEntryController(EntityOwnerService entityOwnerService, IMapper mappingEngine, RecurringSheetEntryRepository recurringSheetEntryRepository) : base(entityOwnerService) {
            this._mappingEngine = mappingEngine;
            this._recurringSheetEntryRepository = recurringSheetEntryRepository;
        }

        // GET: api/sheetentry-recurring
        [HttpGet("")]
        [ReadOnlyApi]
        public IEnumerable<RecurringSheetEntryListing> GetAll() {
            IQueryable<RecurringSheetEntry> all = this._recurringSheetEntryRepository.GetAll().Where(x => x.Owner.Id == this.OwnerId).OrderBy(x => x.SortOrder);
            return this._mappingEngine.Map<IEnumerable<RecurringSheetEntryListing>>(all);
        }

        [HttpPost("{id}/order/{mutation}")]
        public async Task<IActionResult> MutateOrder(int id, SortOrderMutationType mutation) {
            int delta = (int) mutation;

            RecurringSheetEntry entry = await this.GetEntityByIdAsync(id);
            this.EntityOwnerService.EnsureOwner(entry, this.OwnerId);
            Trace.Assert(entry.Category != null);

            entry.SortOrder += delta;

            this._recurringSheetEntryRepository.ReplaceSortOrder(this.OwnerId, entry.SortOrder, entry.SortOrder - delta);
            await this._recurringSheetEntryRepository.SaveChangesAsync();

            return this.NoContent();
        }

        public enum SortOrderMutationType {
            Increase = 1,
            Decrease = -1
        }

        // GET: api/sheetentry-recurring/1
        [HttpGet("{id}", Name = "RecurringSheetEntry-Get")]
        public async Task<RecurringSheetEntryDTO> Get(int id) {
            RecurringSheetEntry entry = await this.GetEntityByIdAsync(id);
            this.EntityOwnerService.EnsureOwner(entry, this.OwnerId);

            return this._mappingEngine.Map<RecurringSheetEntryDTO>(entry);
        }

         // POST: api/sheetentry-recurring
        [HttpPost("")]
        public async Task<IActionResult> Post([FromBody] RecurringSheetEntryDTO value) {
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            RecurringSheetEntry entry = this._mappingEngine.Map<RecurringSheetEntryDTO, RecurringSheetEntry>(value);
            this.EntityOwnerService.AssignOwner(entry, this.OwnerId);

            entry.SortOrder = this._recurringSheetEntryRepository.FindNextSortOrder(this.OwnerId);
            this._recurringSheetEntryRepository.Add(entry);
            await this._recurringSheetEntryRepository.SaveChangesAsync();

            return this.CreatedAtRoute("RecurringSheetEntry-Get", new {id = entry.Id}, await this.Get(entry.Id));
        }

        // PUT: api/sheetentry-recurring/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Put(int id, [FromBody] RecurringSheetEntryDTO value) {
            if (!this.ModelState.IsValid) {
                return this.BadRequest(this.ModelState);
            }

            RecurringSheetEntry entry = await this.GetEntityByIdAsync(id);
            this.EntityOwnerService.EnsureOwner(entry, this.OwnerId);

            this._mappingEngine.Map(value, entry);

            await this._recurringSheetEntryRepository.SaveChangesAsync();

            return this.NoContent();
        }

        // DELETE: api/sheet/2014-11/entries
        [HttpDelete("{id:int}")]
        public async Task Delete(int id) {
            RecurringSheetEntry entry = await this.GetEntityByIdAsync(id);
            this.EntityOwnerService.EnsureOwner(entry, this.OwnerId);

            this._recurringSheetEntryRepository.Delete(entry);
            await this._recurringSheetEntryRepository.SaveChangesAsync();
        }

        private async Task<RecurringSheetEntry> GetEntityByIdAsync(int id) {
            return (await this._recurringSheetEntryRepository.FindByIdAsync(id)).EnsureNotNull();
        }
    }
}