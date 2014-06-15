namespace App.Api {
    using System;
    using System.Threading.Tasks;
    using System.Web;
    using System.Web.Http;
    using Models.DTO;

    [RoutePrefix("api/authentication")]
    public class AuthenticationController : ApiController {
        [HttpPost]
        [Route("login")]
        public Task<AuthenticationInfo> Login([FromBody]LoginModel parameters) {
            throw new NotImplementedException();
        } 
    }
}