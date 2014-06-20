namespace App.Api {
    using System.Collections.Generic;
    using System.Web.Http;
    using Models.DTO;

    public class UserController : ApiController {
        // GET: api/User
        public IEnumerable<AppUserListing> Get() {
            return null;
        }

        // GET: api/User/5
        public AppUserMutate Get(int id) {
            return null;
        }

        // POST: api/User
        public void Post([FromBody] AppUserMutate value) { }

        // PUT: api/User/5
        public void Put(int id, [FromBody] AppUserMutate value) { }

        // DELETE: api/User/5
        public void Delete(int id) {
            
        }
    }
}