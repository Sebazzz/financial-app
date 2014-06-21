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
    using Models.Domain.Identity;
    using Models.Domain.Services;
    using Models.DTO;
    using Sheet = Models.Domain.Sheet;
    using SheetEntry = Models.Domain.SheetEntry;

    public static class AutoMapperConfig {

        public static void Configure() {
            AutoMapper.Mapper.Initialize(x => {
                                             x.ConstructServicesUsing(ContainerConfig.Container.GetInstance);
                                             x.AddGlobalIgnore("Owner");
                                         });

            AutoMapper.Mapper.CreateMap<Category,Category>()
                             .ForMember(x => x.Owner, m=> m.Ignore());

            AutoMapper.Mapper.CreateMap<Sheet, Models.DTO.SheetListing>(MemberList.Destination)
                             .ForMember(x => x.Month, x=>x.MapFrom(z=>z.Subject.Month))
                             .ForMember(x => x.Year, x => x.MapFrom(z => z.Subject.Year));

            AutoMapper.Mapper.CreateMap<Sheet, Models.DTO.Sheet>(MemberList.Destination)
                             .ForMember(x => x.Offset, m => m.ResolveUsing<SheetOffsetCalculationResolver>());

            AutoMapper.Mapper.CreateMap<Models.DTO.Sheet, Sheet>(MemberList.Source)
                             .ForSourceMember(x => x.Offset, m=>m.Ignore());

            AutoMapper.Mapper.CreateMap<AppUser, AppUserListing>(MemberList.Destination);

            AutoMapper.Mapper.CreateMap<SheetEntry, Models.DTO.SheetEntry>(MemberList.Destination)
                .ForMember(x => x.CategoryId, m => m.MapFrom(x => x.Category.Id));

            AutoMapper.Mapper.CreateMap<Models.DTO.SheetEntry, SheetEntry>(MemberList.Source)
                .ForMember(x => x.Category, m => m.MapFrom(s => s.CategoryId))
                .ForSourceMember(x => x.CategoryId, m =>m.Ignore()); // TODO: ignore shouldn't be necessary here

            AutoMapper.Mapper.CreateMap<int, Category>().ConvertUsing<EntityResolver<Category>>();

            AutoMapper.Mapper.AssertConfigurationIsValid();
        }

        // ReSharper disable once ClassNeverInstantiated.Local -- It is instantiated, but using DI
        private sealed class EntityResolver<TEntity> : IValueResolver, ITypeConverter<int, TEntity> where TEntity : class, IHasId {
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
                TEntity entry = ResolveCore(source.Value);
                return source.New(entry, typeof(TEntity));
            }

            private TEntity ResolveCore(object sourceValue) {
                int primaryKey = GetPrimaryKey(sourceValue);
                TEntity result = FindEntityWithPermissionCheck(primaryKey);
                return result;
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
                    return System.Convert.ToInt32(value, CultureInfo.InvariantCulture);
                }catch (InvalidCastException ex) {
                    throw new NotSupportedException("Cannot find PK", ex);
                }
            }

            /// <summary>
            /// Performs conversion from source to destination type
            /// </summary>
            /// <param name="context">Resolution context</param>
            /// <returns>
            /// Destination object
            /// </returns>
            public TEntity Convert(ResolutionContext context) {
                return ResolveCore(context.SourceValue);
            }
        }

        // ReSharper disable once ClassNeverInstantiated.Local -- It is instantiated, but using DI
        private sealed class SheetOffsetCalculationResolver : ValueResolver<Sheet, CalculationOptions> {
            private readonly SheetOffsetCalculationService _offsetCalculationService;

            public SheetOffsetCalculationResolver(SheetOffsetCalculationService offsetCalculationService) {
                this._offsetCalculationService = offsetCalculationService;
            }

            /// <summary>
            /// Implementors override this method to resolve the destination value based on the provided source value
            /// </summary>
            /// <param name="source">Source value</param>
            /// <returns>
            /// Destination
            /// </returns>
            protected override CalculationOptions ResolveCore(Sheet source) {
                return this._offsetCalculationService.CalculateOffset(source);
            }
        }
    }
}