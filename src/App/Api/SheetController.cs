namespace App.Api {
    using System.Collections.Generic;
    using System.Linq;
    using System.Web.Http;
    using Models.DTO;

    public class SheetController : ApiController {
        public IEnumerable<SheetListing> GetAll() {
            return new[] {
                             new SheetListing() {
                                                    Month = 12,
                                                    Name = "Ssss",
                                                    Year = 2013
                                                }
                         };

            //return Enumerable.Empty<SheetListing>();
        }
    }
}