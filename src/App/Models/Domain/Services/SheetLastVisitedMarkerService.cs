// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetLastVisitedMarkerService.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.Domain.Services
{
    using System;
    using System.Threading.Tasks;
    using DTO;
    using Jobs.DelayedSheetVisitUpdateMarker;
    using Repositories;
    using Sheet = Domain.Sheet;

    public class SheetLastVisitedMarkerService
    {
        private readonly SheetLastVisitedMarkerRepository _sheetLastVisitedMarkerRepository;
        private readonly DelayedSheetVisitUpdateJobInvoker _sheetVisitUpdateJob;

        public SheetLastVisitedMarkerService(SheetLastVisitedMarkerRepository sheetLastVisitedMarkerRepository, DelayedSheetVisitUpdateJobInvoker sheetVisitUpdateJob)
        {
            this._sheetLastVisitedMarkerRepository = sheetLastVisitedMarkerRepository;
            this._sheetVisitUpdateJob = sheetVisitUpdateJob;
        }


        public async Task<PreviousSheetVisitMarker> GetAndUpdateAsync([NotNull] Sheet sheet, int userId)
        {
            if (sheet == null) throw new ArgumentNullException(nameof(sheet));

            SheetLastVisitedMarker marker = await this._sheetLastVisitedMarkerRepository.FindAsync(sheet, userId);

            if (marker == null)
            {
                return PreviousSheetVisitMarker.Empty;
            }

            PreviousSheetVisitMarker previousMarker = PreviousSheetVisitMarker.FromSheetLastVisitMarker(marker);

            // Asynchronously update the marker. This is done asynchronously, because it is very confusing otherwise.
            this._sheetVisitUpdateJob.TriggerUpdate(sheet.Id, userId);

            return previousMarker;
        }

        public async Task AddOrUpdateImmediateAsync([NotNull] Sheet sheet, int userId)
        {
            if (sheet == null) throw new ArgumentNullException(nameof(sheet));

            SheetLastVisitedMarker marker = await this._sheetLastVisitedMarkerRepository.FindAsync(sheet, userId);

            if (marker == null)
            {
                marker = new SheetLastVisitedMarker
                {
                    UserId = userId,
                    Sheet = sheet,
                };
                this._sheetLastVisitedMarkerRepository.Add(marker);
            }

            marker.LastVisitDate = DateTime.UtcNow;

            await this._sheetLastVisitedMarkerRepository.SaveChangesAsync();
        }
    }
}
