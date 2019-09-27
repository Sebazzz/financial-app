// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : TagController.cs
//  Project         : App
// ******************************************************************************
namespace App.Api {
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;

    using AutoMapper;
    using Extensions;
    using Microsoft.AspNetCore.Mvc;
    using Models.Domain;
    using Models.Domain.Repositories;
    using Models.Domain.Services;
    using Models.DTO;

    using Support.Filters;

    [Route("api/tag")]
    public sealed class TagController : BaseEntityController {
        private readonly TagRepository _tagRepository;
        private readonly IMapper _mapper;

        public TagController(EntityOwnerService entityOwnerService, 
                             TagRepository tagRepository, 
                             IMapper mapper) : base(entityOwnerService) {
            this._tagRepository = tagRepository;
            this._mapper = mapper;
        }

        // GET: api/tag
        [HttpGet("")]
        [ReadOnlyApi]
        public IEnumerable<TagListing> Get() {
            var q = this._tagRepository.GetByOwner(this.OwnerId).Where(x => x.IsInactive == false);

            return q.Select(x => new TagListing {
                Description = x.Description,
                Name = x.Name,
                Id = x.Id,
                HexColorCode = x.HexColorCode
            }).OrderBy(x => x.Name);
        }



        // GET: api/tag/5
        [HttpGet("{id}", Name = "Tag-Get")]
        [ReadOnlyApi]
        public TagListing Get(int id) {
            Tag entity = this._tagRepository.GetByOwner(this.OwnerId).FirstOrDefault(x=>x.Id ==id).EnsureNotNull();
            return this._mapper.Map<Tag, TagListing>(entity);
        }

        // POST: api/tag
        [HttpPost("")]
        public async Task<IActionResult> Post([FromBody] TagListing value) {
            value.EnsureNotNull(HttpStatusCode.BadRequest);

            if (!this.Validate()) {
                return this.BadRequest(this.ModelState);
            }

            var entity = new Tag();

            this.EntityOwnerService.AssignOwner(entity, this.OwnerId);
            this._mapper.Map(value, entity);
            this._tagRepository.Add(entity);
            await this._tagRepository.SaveChangesAsync();

            return this.CreatedAtRoute("Tag-Get", new {id = entity.Id}, this.Get(entity.Id));
        }

        // PUT: api/tag/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] TagListing value) {
            value.EnsureNotNull(HttpStatusCode.BadRequest);

            if (!this.Validate()) {
                return this.BadRequest(this.ModelState);
            }

            Tag entity = this._tagRepository.FindById(id).EnsureNotNull();
            this.EntityOwnerService.EnsureOwner(entity, this.OwnerId);

            this._mapper.Map(value, entity);
            await this._tagRepository.SaveChangesAsync();

            return this.NoContent();
        }

        // DELETE: api/tag/5
        [HttpDelete("{id}")]
        public async Task Delete(int id) {
            Tag entity = this._tagRepository.FindById(id).EnsureNotNull();
            this.EntityOwnerService.EnsureOwner(entity, this.OwnerId);

            entity.IsInactive = true;
            await this._tagRepository.SaveChangesAsync();
        }

        private bool Validate() {
            this.ModelState.Remove(nameof(Tag.Owner));
            return this.ModelState.IsValid;
        }
    }
}