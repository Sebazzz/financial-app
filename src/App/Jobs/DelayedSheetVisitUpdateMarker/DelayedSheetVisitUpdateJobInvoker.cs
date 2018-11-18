// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : DelayedSheetVisitUpdateJobInvoker.cs
//  Project         : App
// ******************************************************************************
namespace App.Jobs.DelayedSheetVisitUpdateMarker {
    using System;

    public sealed class DelayedSheetVisitUpdateJobInvoker
    {
        public void TriggerUpdate(int sheetId, int userId)
        {
            Hangfire.BackgroundJob.Schedule<DelayedSheetVisitUpdateMarkerJob>(job => job.Update(sheetId, userId), TimeSpan.FromHours(1));
        }
    }
}
