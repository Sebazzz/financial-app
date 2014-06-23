namespace App.Api {
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Linq;
    using System.Net;
    using System.Runtime.Serialization;
    using System.Web.Http;
    using Extensions;
    using Models.Domain.Repositories;
    using Models.Domain.Services;
    using Models.DTO;
    using Models.Domain;
    using Sheet = Models.Domain.Sheet;
    using SheetEntry = Models.Domain.SheetEntry;
    using SheetEntryDTO=Models.DTO.SheetEntry;

    [Authorize]
    [RoutePrefix("api/sheet/{sheetYear:int}-{sheetMonth:int}/entries")]
    public class SheetEntryController : BaseEntityController {
        private readonly SheetEntryRepository _sheetEntryRepository;
        private readonly SheetRetrievalService _sheetRetrievalService;

        public SheetEntryController(EntityOwnerService entityOwnerService, SheetEntryRepository sheetEntryRepository, SheetRetrievalService sheetRetrievalService) : base(entityOwnerService) {
            this._sheetEntryRepository = sheetEntryRepository;
            this._sheetRetrievalService = sheetRetrievalService;
        }

        // GET: api/sheet/1/entries/1
        [HttpGet]
        [Route("{id}")]
        public SheetEntryDTO Get(int id) {
            SheetEntry entry = this._sheetEntryRepository.FindById(id).EnsureNotNull();
            EnsureCorrectSheet(entry);

            return AutoMapper.Mapper.Map<SheetEntryDTO>(entry);
        }

        [Route("order/{mutation}/{id}")]
        [HttpPut]
        public void MutateOrder(int id, SortOrderMutationType mutation) {
            int delta = (int) mutation;

            SheetEntry entry = this._sheetEntryRepository.FindById(id).EnsureNotNull();
            EnsureCorrectSheet(entry);
            Trace.Assert(entry.Category != null);

            entry.Sheet.UpdateTimestamp = DateTime.Now;
            entry.SortOrder += delta;

            this._sheetEntryRepository.ReplaceSortOrder(entry.Sheet, entry.SortOrder, entry.SortOrder - delta);
            this._sheetEntryRepository.SaveChanges();
        }

        public enum SortOrderMutationType {
            Increase = 1,
            Decrease = -1
        }

        // POST: api/sheet/2014-10/entries
        [HttpPost]
        [Route("")]
        public InsertId Post(int sheetYear, int sheetMonth, [FromBody] SheetEntryDTO value) {
            Sheet targetSheet = this._sheetRetrievalService.GetBySubject(sheetMonth, sheetYear, this.OwnerId).EnsureNotNull();
            this.EntityOwnerService.EnsureOwner(targetSheet, this.OwnerId);

            SheetEntry entry = AutoMapper.Mapper.Map<SheetEntryDTO, SheetEntry>(value);
            entry.Sheet = targetSheet;
            entry.CreateTimestamp = DateTime.Now;
            entry.UpdateTimestamp = entry.CreateTimestamp;
            entry.Sheet.UpdateTimestamp = DateTime.Now;
            entry.SortOrder = targetSheet.Entries.Max(x => (int?) x.SortOrder).GetValueOrDefault() + 1;

            this._sheetEntryRepository.Add(entry);
            this._sheetEntryRepository.SaveChanges();

            return entry.Id;
        }

        // PUT: api/sheet/2014-10/entries
        [Route("{id:int}")]
        [HttpPut]
        public InsertId Put(int id, [FromBody] SheetEntryDTO value) {
            SheetEntry entry = this._sheetEntryRepository.FindById(id).EnsureNotNull();
            EnsureCorrectSheet(entry);
            this.EntityOwnerService.EnsureOwner(entry.Sheet, this.OwnerId);

            AutoMapper.Mapper.Map(value, entry);
            entry.UpdateTimestamp = DateTime.Now;
            entry.Sheet.UpdateTimestamp = DateTime.Now;

            this._sheetEntryRepository.SaveChanges();

            return entry.Id;
        }

        // DELETE: api/sheet/2014-11/entries
        [Route("{id:int}")]
        [HttpDelete]
        public void Delete(int id) {
            SheetEntry entry = this._sheetEntryRepository.FindById(id).EnsureNotNull();
            EnsureCorrectSheet(entry);
            this.EntityOwnerService.EnsureOwner(entry.Sheet, this.OwnerId);
            entry.Sheet.UpdateTimestamp = DateTime.Now;

            this._sheetEntryRepository.Delete(entry);
            this._sheetEntryRepository.SaveChanges();
        }


        private void EnsureCorrectSheet(SheetEntry sheetEntry) {
            var routeData = this.RequestContext.RouteData;
            int sheetMonth = Convert.ToInt32(routeData.Values["sheetMonth"]);
            int sheetYear = Convert.ToInt32(routeData.Values["sheetYear"]);

            if (sheetEntry.Sheet.Subject.Month != sheetMonth || sheetEntry.Sheet.Subject.Year != sheetYear) {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }
    }
}