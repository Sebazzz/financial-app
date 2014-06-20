namespace App.Api {
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Web.Http;
    using Extensions;
    using Models.Domain.Repositories;
    using Models.Domain.Services;
    using Models.DTO;
    using Models.Domain;
    using Sheet = Models.Domain.Sheet;
    using SheetEntry = Models.Domain.SheetEntry;
    using SheetEntryDTO=Models.DTO.SheetEntry;

    [RoutePrefix("api/sheet/{sheetId:int}/entries")]
    public class SheetEntryController : BaseEntityController {
        private readonly SheetEntryRepository _sheetEntryRepository;
        private readonly SheetRepository _sheetRepository;

        public SheetEntryController(EntityOwnerService entityOwnerService, SheetEntryRepository sheetEntryRepository, SheetRepository sheetRepository) : base(entityOwnerService) {
            this._sheetEntryRepository = sheetEntryRepository;
            this._sheetRepository = sheetRepository;
        }

        // POST: api/sheet/1/entries
        [HttpPost]
        [Route("")]
        public InsertId Post(int sheetId, [FromBody] SheetEntryDTO value) {
            Sheet targetSheet = this._sheetRepository.FindById(sheetId).EnsureNotNull();
            this.EntityOwnerService.EnsureOwner(targetSheet, this.OwnerId);

            SheetEntry entry = AutoMapper.Mapper.Map<SheetEntryDTO, SheetEntry>(value);
            entry.Sheet = targetSheet;
            entry.CreateTimestamp = DateTime.Now;
            entry.UpdateTimestamp = entry.CreateTimestamp;
            entry.Sheet.UpdateTimestamp = DateTime.Now;

            this._sheetEntryRepository.Add(entry);
            this._sheetEntryRepository.SaveChanges();

            return entry.Id;
        }

        // PUT: api/sheet/1/entries
        [Route("{id:int}")]
        [HttpPut]
        public InsertId Put(int sheetId, int id, [FromBody] SheetEntryDTO value) {
            SheetEntry entry = this._sheetEntryRepository.FindById(id).EnsureNotNull();
            EnsureCorrectSheet(entry, sheetId);
            this.EntityOwnerService.EnsureOwner(entry.Sheet, this.OwnerId);

            AutoMapper.Mapper.Map(value, entry);
            entry.UpdateTimestamp = DateTime.Now;
            entry.Sheet.UpdateTimestamp = DateTime.Now;

            this._sheetEntryRepository.SaveChanges();

            return entry.Id;
        }

        // DELETE: api/sheet/1/entries
        [Route("{id:int}")]
        [HttpDelete]
        public void Delete(int sheetId, int id) {
            SheetEntry entry = this._sheetEntryRepository.FindById(id).EnsureNotNull();
            EnsureCorrectSheet(entry, sheetId);
            this.EntityOwnerService.EnsureOwner(entry.Sheet, this.OwnerId);
            entry.Sheet.UpdateTimestamp = DateTime.Now;

            this._sheetEntryRepository.Delete(entry);
            this._sheetEntryRepository.SaveChanges();
        }


        private static void EnsureCorrectSheet(SheetEntry sheetEntry, int sheetId) {
            if (sheetEntry.Sheet.Id != sheetId) {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }
    }
}