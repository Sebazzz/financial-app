namespace App.Models.Domain.Services {
    using System.Diagnostics;
    using System.Net;
    using System.Web.Http;
    using Repositories;

    public class EntityOwnerService {
        private readonly AppOwnerRepository _appOwnerRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public EntityOwnerService(AppOwnerRepository appOwnerRepository) {
            this._appOwnerRepository = appOwnerRepository;
        }

        /// <summary>
        /// Assigns an owner to the specified entity
        /// </summary>
        /// <param name="entity"></param>
        /// <param name="ownerId"></param>
        public void AssignOwner(IAppOwnerEntity entity, int ownerId) {
            AppOwner owner = this._appOwnerRepository.FindById(ownerId);
            Debug.Assert(owner != null);

            entity.Owner = owner;
        }

        /// <summary>
        /// Ensures the owner of the entity matches
        /// </summary>
        /// <param name="entity"></param>
        /// <param name="ownerId"></param>
        public void EnsureOwner(IAppOwnerEntity entity, int ownerId) {
            if (entity.Owner.Id != ownerId) {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
            }
        }
    }
}