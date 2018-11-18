// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetLastVisitedMarkerRepository.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.Domain.Repositories
{
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;

    public class SheetLastVisitedMarkerRepository
    {
        private readonly DbContext _dbContext;
        private readonly DbSet<SheetLastVisitedMarker> _entitySet;

        public SheetLastVisitedMarkerRepository(DbContext dbContext) {
            this._dbContext = dbContext;
            this._entitySet = dbContext.Set<SheetLastVisitedMarker>();
        }

        public void Add(SheetLastVisitedMarker marker)
        {
            this._entitySet.Add(marker);
        }

        public Task<SheetLastVisitedMarker> FindAsync(Sheet sheet, int userId)
        {
            return this._entitySet.FirstOrDefaultAsync(x => x.SheetId == sheet.Id && x.UserId == userId);
        }

        public Task SaveChangesAsync() {
            return this._dbContext.SaveChangesAsync();
        }
    }
}
