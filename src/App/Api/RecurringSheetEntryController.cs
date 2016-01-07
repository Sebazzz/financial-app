namespace App.Api {
    using System.Collections.Generic;
    using System.Linq;
    using AutoMapper;
    using Extensions;
    using Microsoft.AspNet.Authorization;
    using Microsoft.AspNet.Mvc;
    using Models.Domain.Repositories;
    using Models.Domain.Services;
    using Models.DTO;
    using RecurringSheetEntry = Models.Domain.RecurringSheetEntry;
    using RecurringSheetEntryDTO=Models.DTO.RecurringSheetEntry;

    [Authorize]
    [Route("api/sheetentry-recurring")]
    public class RecurringSheetEntryController : BaseEntityController {
        private readonly IMappingEngine _mappingEngine;
        private readonly RecurringSheetEntryRepository _recurringSheetEntryRepository;

        public RecurringSheetEntryController(EntityOwnerService entityOwnerService, IMappingEngine mappingEngine, RecurringSheetEntryRepository recurringSheetEntryRepository) : base(entityOwnerService) {
            this._mappingEngine = mappingEngine;
            this._recurringSheetEntryRepository = recurringSheetEntryRepository;
        }

        // GET: api/sheetentry-recurring
        [HttpGet]
        [Route("")]
        public IEnumerable<RecurringSheetEntryListing> GetAll() {
            IQueryable<RecurringSheetEntry> all = this._recurringSheetEntryRepository.GetAll().Where(x => x.Owner.Id == this.OwnerId);
            return this._mappingEngine.Map<IEnumerable<RecurringSheetEntryListing>>(all);
        }

        // GET: api/sheetentry-recurring/1
        [HttpGet]
        [Route("{id}")]
        public RecurringSheetEntryDTO Get(int id) {
            RecurringSheetEntry entry = this._recurringSheetEntryRepository.FindById(id).EnsureNotNull();
            this.EntityOwnerService.EnsureOwner(entry, this.OwnerId);

            return this._mappingEngine.Map<RecurringSheetEntryDTO>(entry);
        }

         // POST: api/sheetentry-recurring
        [HttpPost]
        [Route("")]
        public InsertId Post([FromBody] RecurringSheetEntryDTO value) {
            RecurringSheetEntry entry = this._mappingEngine.Map<RecurringSheetEntryDTO, RecurringSheetEntry>(value);
            this.EntityOwnerService.AssignOwner(entry, this.OwnerId);

            this._recurringSheetEntryRepository.Add(entry);
            this._recurringSheetEntryRepository.SaveChanges();

            return entry.Id;
        }

        // PUT: api/sheetentry-recurring/5
        [Route("{id:int}")]
        [HttpPut]
        public InsertId Put(int id, [FromBody] RecurringSheetEntryDTO value) {
            RecurringSheetEntry entry = this._recurringSheetEntryRepository.FindById(id).EnsureNotNull();
            this.EntityOwnerService.EnsureOwner(entry, this.OwnerId);

            this._mappingEngine.Map(value, entry);

            this._recurringSheetEntryRepository.SaveChanges();

            return entry.Id;
        }

        // DELETE: api/sheet/2014-11/entries
        [Route("{id:int}")]
        [HttpDelete]
        public void Delete(int id) {
            RecurringSheetEntry entry = this._recurringSheetEntryRepository.FindById(id).EnsureNotNull();
            this.EntityOwnerService.EnsureOwner(entry, this.OwnerId);

            this._recurringSheetEntryRepository.Delete(entry);
            this._recurringSheetEntryRepository.SaveChanges();
        }
    }
}