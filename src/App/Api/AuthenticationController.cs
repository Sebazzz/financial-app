namespace App.Api {
    using System;
    using System.Threading.Tasks;
    using System.Web;
    using System.Web.Http;

    [RoutePrefix("authentication")]
    public class AuthenticationController : ApiController {
        [HttpPost]
        [Route("login")]
        public Task<HttpResponse> Login(string userName, string password, bool persistent) {
            throw new NotImplementedException();
        } 
    }
}