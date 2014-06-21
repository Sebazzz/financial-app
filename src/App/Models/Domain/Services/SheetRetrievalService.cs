namespace App.Models.Domain.Services {
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using Api.Extensions;
    using AutoMapper.QueryableExtensions;
    using DTO;
    using Repositories;
    using Sheet = Domain.Sheet;

    public class SheetRetrievalService {
        private readonly SheetRepository _sheetRepository;
        private readonly AppOwnerRepository _appOwnerRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public SheetRetrievalService(SheetRepository sheetRepository, AppOwnerRepository appOwnerRepository) {
            this._sheetRepository = sheetRepository;
            this._appOwnerRepository = appOwnerRepository;
        }

        [NotNull]
        public IEnumerable<SheetListing> GetAll(int ownerId) {
            var sheets = GetAllCore(ownerId);
            
            // generate a fake sheet entry if none are available
            // when the sheet will be requested initially, the 'real'
            // sheet entry will be created
            return sheets.DefaultIfEmpty(
                        AutoMapper.Mapper.Map<Sheet, SheetListing>(
                            CreateCurrentMonthSheet(ownerId)));
        }

        private IEnumerable<SheetListing> GetAllCore(int ownerId) {
            IQueryable<Sheet> allSheets = this._sheetRepository.GetByOwner(ownerId);

            return allSheets.OrderByDescending(x => x.Subject)
                            .Project()
                            .To<SheetListing>();
        }

        [NotNull]
        public Sheet GetBySubject(int month, int year, int ownerId) {
            Sheet theSheet = this._sheetRepository.GetByDatePart(month, year, ownerId).FirstOrDefault();

            if (theSheet == null) {
                theSheet = CreateCurrentMonthSheet(ownerId);
            
                this._sheetRepository.Add(theSheet);
                this._sheetRepository.SaveChanges();
            }

            return theSheet;
        }

        private Sheet CreateCurrentMonthSheet(int ownerId) {
            return CreateSheet(DateTime.Now.Month, DateTime.Now.Year, ownerId);
        }

        private Sheet CreateSheet(int month, int year, int ownerId) {
            Sheet sheet = new Sheet();

            sheet.Subject = new DateTime(year, month, 1);
            sheet.Owner = this._appOwnerRepository.FindById(ownerId).EnsureNotNull(HttpStatusCode.BadRequest);

            return sheet;
        }
    }
}