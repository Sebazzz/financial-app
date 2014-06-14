namespace App.Api {
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Web.Http;
    using Extensions;
    using Models;
    using Models.Domain;
    using Models.DTO;

    public class CategoryController : ApiController {
        private static readonly List<Category> Categories = new List<Category>{};

        // GET: api/Category
        public IEnumerable<CategoryListing> Get() {
            return Categories.Select(x => new CategoryListing() {
                                                                    Description = x.Description,
                                                                    Name = x.Name,
                                                                    Id = x.Id
                                                                });
        }

        // GET: api/Category/5
        public Category Get(int id) {
            return Categories.FirstOrDefault(x => x.Id == id).EnsureNotNull();
        }

        // POST: api/Category
        public void Post([FromBody] Category value) {
            value.EnsureNotNull(HttpStatusCode.BadRequest);

            Categories.Add(value);
        }

        // PUT: api/Category/5
        public void Put(int id, [FromBody] Category value) {
            value.EnsureNotNull(HttpStatusCode.BadRequest);

            Category c = this.Get(id);
            Categories[Categories.IndexOf(c)] = value;
        }

        // DELETE: api/Category/5
        public void Delete(int id) {
            Category c = this.Get(id);
            Categories.Remove(c);
        }


        
    }
}