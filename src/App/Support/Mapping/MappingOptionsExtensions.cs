// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : MappingOptionsExtensions.cs
//  Project         : App
// ******************************************************************************

namespace App.Support.Mapping
{
    using System;
    using System.Collections.Generic;
    using AutoMapper;
    using Models.Domain;
    using Models.DTO;
    using SheetDTO = Models.DTO.Sheet;
    using Sheet = Models.Domain.Sheet;
    using SheetEntryDTO = Models.DTO.SheetEntry;
    using SheetEntry = Models.Domain.SheetEntry;

    public static class MappingOptionsExtensions
    {
        private const string SheetLastVisitedMarkerKey = nameof(SheetLastVisitedMarkerKey);

        public static void SetPreviousSheetVisitMarker(
            [NotNull] this IMappingOperationOptions<Sheet, SheetDTO> mappingOperationOptions,
            [NotNull] PreviousSheetVisitMarker marker
        )
        {
            if (mappingOperationOptions == null) throw new ArgumentNullException(nameof(mappingOperationOptions));
            if (marker == null) throw new ArgumentNullException(nameof(marker));

            try
            {
                mappingOperationOptions.Items.Add(SheetLastVisitedMarkerKey, marker);
            }
            catch (ArgumentException ex)
            {
                throw new InvalidOperationException($"{nameof(SetPreviousSheetVisitMarker)} has been called earlier", ex);
            }
        }

        public static void SetPreviousSheetVisitMarker(
            [NotNull] this IMappingOperationOptions<SheetEntry, SheetEntryDTO> mappingOperationOptions,
            [NotNull] PreviousSheetVisitMarker marker
        )
        {
            if (mappingOperationOptions == null) throw new ArgumentNullException(nameof(mappingOperationOptions));
            if (marker == null) throw new ArgumentNullException(nameof(marker));

            try
            {
                mappingOperationOptions.Items.Add(SheetLastVisitedMarkerKey, marker);
            }
            catch (ArgumentException ex)
            {
                throw new InvalidOperationException($"{nameof(SetPreviousSheetVisitMarker)} has been called earlier", ex);
            }
        }


        public static PreviousSheetVisitMarker GetPreviousSheetVisitMarker(this ResolutionContext resolutionContext)
        {
            try
            {
                return (PreviousSheetVisitMarker) resolutionContext.Items[SheetLastVisitedMarkerKey];
            }
            catch (KeyNotFoundException ex)
            {
                throw new InvalidOperationException($"{nameof(SetPreviousSheetVisitMarker)} has not been called", ex);
            }
            catch (InvalidCastException ex)
            {
                throw new InvalidOperationException($"{nameof(SheetLastVisitedMarkerKey)} contains an invalid object", ex);
            }
        }
    }
}
