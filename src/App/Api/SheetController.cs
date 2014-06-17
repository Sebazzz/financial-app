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

    public class SheetController : BaseEntityController {
        private readonly SheetRepository _sheetRepository;

        public SheetController(EntityOwnerService entityOwnerService, SheetRepository sheetRepository) : base(entityOwnerService) {
            this._sheetRepository = sheetRepository;
        }

        public SheetDTO GetById(int id) {
            Sheet sheet = this._sheetRepository.FindByIdInclude(id)
                                               .Include(x=>x.Entries)
                                               .FirstOrDefault();
            sheet.EnsureNotNull();

            this.EntityOwnerService.EnsureOwner(sheet, this.OwnerId);

            return AutoMapper.Mapper.Map<Sheet, SheetDTO>(sheet);
        }

        public IEnumerable<SheetListing> GetAll() {
            IQueryable<Sheet> allSheets = this._sheetRepository.GetByOwner(this.OwnerId);

            return allSheets.Project()
                            .To<SheetListing>();
        }
    }
}