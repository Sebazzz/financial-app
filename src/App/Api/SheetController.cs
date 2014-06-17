namespace App.Api {
    using System.Collections.Generic;
    using System.Data.Entity;
    using System.Linq;
    using System.Web.Http;
    using AutoMapper.QueryableExtensions;
    using Extensions;
    using Models.DTO;
    using SheetDTO=Models.DTO.Sheet;
    using Sheet = Models.Domain.Sheet;
    using Models.Domain.Repositories;
    using Models.Domain.Services;

    [RoutePrefix("api/sheet")]
    public class SheetController : BaseEntityController {
        private readonly SheetRepository _sheetRepository;
        private readonly SheetRetrievalService _sheetRetrievalService;

        public SheetController(EntityOwnerService entityOwnerService, SheetRepository sheetRepository, SheetRetrievalService sheetRetrievalService) : base(entityOwnerService) {
            this._sheetRepository = sheetRepository;
            this._sheetRetrievalService = sheetRetrievalService;
        }

        public SheetDTO GetById(int id) {
            Sheet sheet = this._sheetRepository.FindByIdInclude(id)
                                               .Include(x=>x.Entries)
                                               .FirstOrDefault();
            sheet.EnsureNotNull();

            this.EntityOwnerService.EnsureOwner(sheet, this.OwnerId);

            return AutoMapper.Mapper.Map<Sheet, SheetDTO>(sheet);
        }

        [HttpGet]
        [Route("{year:int:max(2100):min(2000)}/{month:int:max(12):min(1)}")]
        public SheetDTO GetBySubject(int month, int year) {
            Sheet theSheet = this._sheetRetrievalService.GetBySubject(month, year, this.OwnerId);

            return AutoMapper.Mapper.Map<Sheet, SheetDTO>(theSheet);
        }

        public IEnumerable<SheetListing> GetAll() {
            IEnumerable<SheetListing> allSheets = this._sheetRetrievalService.GetAll(this.OwnerId);
            return allSheets;
        }
    }
}