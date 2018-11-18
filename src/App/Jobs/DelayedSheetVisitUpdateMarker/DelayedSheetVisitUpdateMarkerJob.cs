// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DelayedSheetVisitUpdateMarkerJob.cs
//  Project         : App
// ******************************************************************************

namespace App.Jobs.DelayedSheetVisitUpdateMarker {
    using System;
    using System.Threading.Tasks;
    using Models.Domain;
    using Models.Domain.Repositories;
    using Models.Domain.Services;

    public sealed class DelayedSheetVisitUpdateMarkerJob
    {
        private readonly SheetRepository _sheetRepository;
        private readonly SheetLastVisitedMarkerService _sheetLastVisitedMarkerService;

        public DelayedSheetVisitUpdateMarkerJob(SheetLastVisitedMarkerService sheetLastVisitedMarkerService, SheetRepository sheetRepository)
        {
            this._sheetLastVisitedMarkerService = sheetLastVisitedMarkerService;
            this._sheetRepository = sheetRepository;
        }

        public async Task Update(Int32 sheetId, Int32 userId)
        {
            Sheet sheet = await this._sheetRepository.FindByIdAsync(sheetId);

            if (sheet == null)
            {
                return;
            }

            await this._sheetLastVisitedMarkerService.AddOrUpdateImmediateAsync(sheet, userId);
        }
    }
}
