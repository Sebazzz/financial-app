// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TagReportController.cs
//  Project         : App
// ******************************************************************************
namespace App.Api {
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using AutoMapper;
    using AutoMapper.QueryableExtensions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.EntityFrameworkCore;
    using Models.Domain;
    using Models.Domain.Repositories;
    using Models.Domain.Services;
    using Models.DTO;

    [Route("api/report/tag/{tagId:int}")]
    public sealed class TagReportController : BaseEntityController {
        private int TagId => Int32.Parse((string)this.RouteData.Values["tagId"]);

        private readonly TagRepository _tagRepository;
        private readonly SheetEntryRepository _sheetEntryRepository;
        private readonly IMapper _mapper;

        public TagReportController(IMapper mapper, SheetEntryRepository sheetEntryRepository, TagRepository tagRepository, EntityOwnerService entityOwnerService) : base(entityOwnerService) {
            this._mapper = mapper;
            this._sheetEntryRepository = sheetEntryRepository;
            this._tagRepository = tagRepository;
        }

        [HttpGet("entries")]
        public IActionResult GetSheetEntries() {
            var entries =
                this._sheetEntryRepository.GetAll()
                    .Where(entry => entry.Tags.Any(et => et.TagId == this.TagId))
                    .Include(x => x.Tags)
                    .ThenInclude(x => x.Tag)
                    .OrderBy(x => x.Sheet.Subject)
                    .ThenBy(x => x.SortOrder);

            return this.Ok(this._mapper.Map<IEnumerable<TagReportSheetEntry>>(entries));
        }

        public override void OnActionExecuting(ActionExecutingContext context) {
            Tag tag = this._tagRepository.FindById(this.TagId);
            this.EntityOwnerService.EnsureOwner(tag, this.OwnerId);

            base.OnActionExecuting(context);
        }
    }
}