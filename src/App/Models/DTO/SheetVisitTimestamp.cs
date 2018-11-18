// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetVisitTimestamp.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.DTO {
    using System;
    using Domain;

    public class PreviousSheetVisitMarker {
        public DateTime LastVisitDate { get; }

        /// <summary>
        /// Represents a sheet marker from a sheet not earlier visited. This app didn't exist in 2015.
        /// </summary>
        public static readonly PreviousSheetVisitMarker Empty = new PreviousSheetVisitMarker(new DateTime(2015, 07, 30));

        private PreviousSheetVisitMarker(DateTime lastVisitDate)
        {
            this.LastVisitDate = lastVisitDate;
        }

        public static PreviousSheetVisitMarker FromSheetLastVisitMarker(SheetLastVisitedMarker marker)
        {
            return new PreviousSheetVisitMarker(marker.LastVisitDate);
            ;
        }
    }
}
