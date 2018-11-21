// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : CategoryController.cs
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
    using Microsoft.EntityFrameworkCore;
    using Models.Domain;
    using Models.Domain.Repositories;
    using Models.Domain.Services;
    using Models.DTO;

    using Support.Filters;

    [Route("api/category")]
    public sealed class CategoryController : BaseEntityController {
        private readonly CategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public CategoryController(EntityOwnerService entityOwnerService, 
                                  CategoryRepository categoryRepository, 
                                  IMapper mapper) : base(entityOwnerService) {
            this._categoryRepository = categoryRepository;
            this._mapper = mapper;
        }

        // GET: api/Category
        [HttpGet("")]
        [ReadOnlyApi]
        public async Task<IActionResult> Get() {
            IQueryable<CategoryListing> q = this._categoryRepository.GetListingByOwner(this.OwnerId);

            return this.Ok(await q.OrderBy(x => x.Name).ToListAsync(this.HttpContext.RequestAborted));
        }



        // GET: api/Category/5
        [HttpGet("{id}", Name = "Category-Get")]
        [ReadOnlyApi]
        public Category Get(int id) {
            return this._categoryRepository.GetByOwner(this.OwnerId).FirstOrDefault(x=>x.Id ==id).EnsureNotNull();
        }

        // POST: api/Category
        [HttpPost("")]
        public async Task<IActionResult> Post([FromBody] Category value) {
            value.EnsureNotNull(HttpStatusCode.BadRequest);

            if (!this.Validate()) {
                return this.BadRequest(this.ModelState);
            }

            this.EntityOwnerService.AssignOwner(value, this.OwnerId);
            this._categoryRepository.Add(value);
            await this._categoryRepository.SaveChangesAsync();

            return this.CreatedAtRoute("Category-Get", new {id = value.Id}, this.Get(value.Id));
        }

        // PUT: api/Category/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Category value) {
            value.EnsureNotNull(HttpStatusCode.BadRequest);

            if (!this.Validate()) {
                return this.BadRequest(this.ModelState);
            }

            Category c = this.Get(id);
            this.EntityOwnerService.EnsureOwner(c, this.OwnerId);

            this._mapper.Map(value, c);
            await this._categoryRepository.SaveChangesAsync();

            return this.NoContent();
        }

        // DELETE: api/Category/5
        [HttpDelete("{id}")]
        public async Task Delete(int id) {
            Category c = this.Get(id);
            this.EntityOwnerService.EnsureOwner(c, this.OwnerId);

            this._categoryRepository.Delete(c);
            await this._categoryRepository.SaveChangesAsync();
        }

        private bool Validate() {
            this.ModelState.Remove(nameof(Category.Owner));
            return this.ModelState.IsValid;
        }
    }
}
