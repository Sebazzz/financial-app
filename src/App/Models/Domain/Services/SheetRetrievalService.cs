// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetRetrievalService.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Services {
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using Api.Extensions;
    using AutoMapper;
    using AutoMapper.QueryableExtensions;
    using DTO;
    using Microsoft.EntityFrameworkCore;
    using Repositories;
    using Sheet = Domain.Sheet;

    public class SheetRetrievalService {
        private readonly SheetRepository _sheetRepository;
        private readonly AppOwnerRepository _appOwnerRepository;
        private readonly IMapper _mappingEngine;
        private readonly RecurringSheetEntryRepository _recurringSheetEntryRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public SheetRetrievalService(SheetRepository sheetRepository, AppOwnerRepository appOwnerRepository, IMapper mappingEngine, RecurringSheetEntryRepository recurringSheetEntryRepository) {
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
                            .ProjectTo<SheetListing>(this._mappingEngine.ConfigurationProvider);
        }

        [NotNull]
        public async Task<Sheet> GetBySubjectAsync(int month, int year, int ownerId) {
            Sheet theSheet = await this._sheetRepository.GetByDatePart(month, year, ownerId)
                                                  .Include(x => x.Owner)
                                                  .FirstOrDefaultAsync();

            if (theSheet == null) {
                theSheet = this.CreateSheet(month, year, ownerId);

                // Even though CalculationOptions shares the table, it is a fully fledged
                // entity and needs to be registered with EF together with the Sheet entity itself.
                this._sheetRepository.Add(theSheet.CalculationOptions);
                this._sheetRepository.Add(theSheet);

                await this._sheetRepository.SaveChangesAsync();
            }
            else {
                theSheet.Entries = await this._sheetRepository.GetOfSheet(theSheet).ToListAsync();
                theSheet.ApplicableTemplates = await this._sheetRepository.GetTemplatesOfSheet(theSheet).ToListAsync();
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
