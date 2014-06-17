namespace App {
    using System;
    using System.Collections.Generic;
    using System.Data.Entity;
    using System.Globalization;
    using System.Linq;
    using Api.Extensions;
    using AutoMapper;
    using Microsoft.Owin;
    using Models.Domain;
    using Models.Domain.Services;

    public static class AutoMapperConfig {

        public static void Configure() {
            AutoMapper.Mapper.Initialize(x => {
                                             x.ConstructServicesUsing(ContainerConfig.Container.GetInstance);
                                             x.AddGlobalIgnore("Owner");
                                         });

            AutoMapper.Mapper.CreateMap<Category,Category>();

            AutoMapper.Mapper.CreateMap<Sheet, Models.DTO.SheetListing>(MemberList.Destination)
                             .ForMember(x => x.Month, x=>x.MapFrom(z=>z.Subject.Month))
                             .ForMember(x => x.Year, x => x.MapFrom(z => z.Subject.Year));

            AutoMapper.Mapper.CreateMap<Sheet, Models.DTO.Sheet>(MemberList.Destination);

            AutoMapper.Mapper.CreateMap<Models.DTO.Sheet, Sheet>(MemberList.Source);

            AutoMapper.Mapper.CreateMap<SheetEntry, Models.DTO.SheetEntry>(MemberList.Destination)
                .ForMember(x => x.CategoryId, m => m.MapFrom(x => x.Category.Id));

            AutoMapper.Mapper.CreateMap<Models.DTO.SheetEntry, SheetEntry>(MemberList.Source)
                .ForMember(x => x.Category, m => m.ResolveUsing(typeof(EntityResolver<Category>)).FromMember(x=>x.CategoryId))
                .ForSourceMember(x => x.CategoryId, m =>m.Ignore()); // TODO: ignore shouldn't be necessary here

            AutoMapper.Mapper.AssertConfigurationIsValid();
        }

        private sealed class EntityResolver<TEntity> : IValueResolver where TEntity : class, IHasId {
            private readonly IOwinContext _owinContext;
            private readonly EntityOwnerService _entityOwnerService;

            private readonly IDbSet<TEntity> _entities;

            /// <summary>
            /// Initializes a new instance of the <see cref="T:System.Object"/> class.
            /// </summary>
            public EntityResolver(AppDbContext dbContext, EntityOwnerService entityOwnerService, IOwinContext owinContext) {
                this._entityOwnerService = entityOwnerService;
                this._owinContext = owinContext;

                this._entities = dbContext.Set<TEntity>();
            }


            /// <summary>
            /// Implementors use source resolution result to provide a destination resolution result.
            ///             Use the <see cref="T:AutoMapper.ValueResolver`2"/> class for a type-safe version.
            /// </summary>
            /// <param name="source">Source resolution result</param>
            /// <returns>
            /// Result, typically build from the source resolution result
            /// </returns>
            public ResolutionResult Resolve(ResolutionResult source) {
                int primaryKey = GetPrimaryKey(source.Value);
                TEntity result = FindEntity(primaryKey);

                return source.New(result);
            }

            private TEntity FindEntityWithPermissionCheck(int key) {
                TEntity entity = this.FindEntity(key);

                VerifyOwnership(entity as IAppOwnerEntity);

                return entity;
            }

            private void VerifyOwnership(IAppOwnerEntity appOwnerEntity) {
                if (appOwnerEntity == null) {
                    return;
                }

                int appOwnerId = GetAppOwnerId(this._owinContext);
                this._entityOwnerService.EnsureOwner(appOwnerEntity, appOwnerId);
            }

            private static int GetAppOwnerId(IOwinContext context) {
                return context.Request.User.Identity.GetOwnerGroupId();
            }

            private TEntity FindEntity(int key) {
                return this._entities.FirstOrDefault(x => x.Id == key);
            }

            private static int GetPrimaryKey(object value) {
                IHasId hasId = value as IHasId;
                if (hasId != null) {
                    return hasId.Id;
                }

                try {
                    return Convert.ToInt32(value, CultureInfo.InvariantCulture);
                }catch (InvalidCastException ex) {
                    throw new NotSupportedException("Cannot find PK", ex);
                }
            }
        }
    }
}