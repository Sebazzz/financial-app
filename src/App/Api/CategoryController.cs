namespace App.Api {
    using System.Collections.Generic;
    using System.Web.Http;
    using Models;
    using Models.DTO;

    public class CategoryController : ApiController {
        // GET: api/Category
        public IEnumerable<CategoryListing> Get() {
            return new[] {
                             new CategoryListing() {
                                                Description = "Testcategorie 1",
                                                Name = "Categorie",
                                                Id = 1
                                            }
                         };
        }

        // GET: api/Category/5
        public Category Get(int id) {
            return null;
        }

        // POST: api/Category
        public void Post([FromBody] Category value) { }

        // PUT: api/Category/5
        public void Put(int id, [FromBody] Category value) { }

        // DELETE: api/Category/5
        public void Delete(int id) {}
    }
}