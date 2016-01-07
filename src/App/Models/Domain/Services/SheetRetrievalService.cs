namespace App.Models.Domain.Services {
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using Api.Extensions;
    using AutoMapper;
    using AutoMapper.QueryableExtensions;
    using DTO;
    using Microsoft.Data.Entity;
    using Repositories;
    using Sheet = Domain.Sheet;

    public class SheetRetrievalService {
        private readonly SheetRepository _sheetRepository;
        private readonly AppOwnerRepository _appOwnerRepository;
        private readonly IMappingEngine _mappingEngine;
        private readonly RecurringSheetEntryRepository _recurringSheetEntryRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public SheetRetrievalService(SheetRepository sheetRepository, AppOwnerRepository appOwnerRepository, IMappingEngine mappingEngine, RecurringSheetEntryRepository recurringSheetEntryRepository) {
            this._sheetRepository = sheetRepository;
            this._appOwnerRepository = appOwnerRepository;
            this._mappingEngine = mappingEngine;
            this._recurringSheetEntryRepository = recurringSheetEntryRepository;
        }

        [NotNull]
        public IEnumerable<SheetListing> GetAll(int ownerId) {
            IEnumerable<SheetListing> sheets = this.GetAllCore(ownerId);
            
            // generate a fake sheet entry if none are available
            // when the sheet will be requested initially, the 'real'
            // sheet entry will be created
            var all = sheets.DefaultIfEmpty(this._mappingEngine.Map<Sheet, SheetListing>(this.CreateCurrentMonthSheet(ownerId)));

            SheetTotals totals = new SheetTotals{BankAccount = 0, SavingsAccount = 0};
            foreach (SheetListing listing in all) {
                totals.BankAccount += listing.Totals.BankAccount ?? 0;
                totals.SavingsAccount += listing.Totals.SavingsAccount ?? 0;

                listing.Totals.BankAccount = totals.BankAccount;
                listing.Totals.SavingsAccount = totals.SavingsAccount;

                yield return listing;
            }
        }

        private IEnumerable<SheetListing> GetAllCore(int ownerId) {
            IQueryable<Sheet> allSheets = this._sheetRepository.GetByOwner(ownerId);

            return allSheets.OrderBy(x => x.Subject)
                            .ProjectTo<SheetListing>();
        }

        [NotNull]
        public Sheet GetBySubject(int month, int year, int ownerId) {
            Sheet theSheet = this._sheetRepository.GetByDatePart(month, year, ownerId)
                                                  .Include(x => x.Owner)
                                                  .FirstOrDefault();

            if (theSheet == null) {
                theSheet = this.CreateSheet(month, year, ownerId);

                this._sheetRepository.Add(theSheet);
                this._sheetRepository.SaveChanges();
            }
            else {
                theSheet.Entries = new List<Domain.SheetEntry>(this._sheetRepository.GetOfSheet(theSheet));
                theSheet.ApplicableTemplates = new List<Domain.SheetRecurringSheetEntry>(this._sheetRepository.GetTemplatesOfSheet(theSheet));
            }

            return theSheet;
        }

        private Sheet CreateCurrentMonthSheet(int ownerId) {
            return this.CreateSheet(DateTime.Now.Month, DateTime.Now.Year, ownerId);
        }

        private Sheet CreateSheet(int month, int year, int ownerId) {
            Sheet sheet = new Sheet();

            sheet.Subject = new DateTime(year, month, 1);
            sheet.Owner = this._appOwnerRepository.FindById(ownerId).EnsureNotNull(HttpStatusCode.BadRequest);
            sheet.ApplicableTemplates = new List<SheetRecurringSheetEntry>(
                this._recurringSheetEntryRepository.GetByOwner(ownerId).Select(x => SheetRecurringSheetEntry.Create(sheet, x)));

            return sheet;
        }
    }
}