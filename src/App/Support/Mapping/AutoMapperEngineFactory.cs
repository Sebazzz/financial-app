// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AutoMapperEngineFactory.cs
//  Project         : App
// ******************************************************************************
namespace App {
    using System;
    using System.Globalization;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Reflection;
    using Api.Extensions;
    using AutoMapper;
    using Microsoft.AspNetCore.Http;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using Models.Domain;
    using Models.Domain.Identity;
    using Models.Domain.Services;
    using Models.DTO;
    using Support.Mapping;
    using Sheet = Models.Domain.Sheet;
    using SheetEntry = Models.Domain.SheetEntry;
    using RecurringSheetEntry = Models.Domain.RecurringSheetEntry;

    public static class AutoMapperEngineFactory {
        public static IMapper Create(IServiceProvider serviceProvider) {
            var config = new MapperConfiguration(cfg => {
                cfg.ConstructServicesUsing(t => serviceProvider.GetRequiredService<IHttpContextAccessor>().HttpContext.RequestServices.GetService(t));
                cfg.AddGlobalIgnore("Owner");

                cfg.DisableConstructorMapping();
                cfg.RecognizePostfixes("Id");

                cfg.CreateMap<PreferencesModel, AppUserPreferences>().ReverseMap();

                cfg.CreateMap<Category,Category>()
                   .ForMember(x => x.Owner, m=> m.Ignore());

                cfg.CreateMap<Sheet, Models.DTO.SheetListing>(MemberList.Destination)
                                 .ForMember(x => x.Month, x=>x.MapFrom(z=>z.Subject.Month))
                                 .ForMember(x => x.Year, x => x.MapFrom(z => z.Subject.Year))
                                 .ForMember(x => x.Totals, x => x.MapFrom(z => new SheetTotals {
                    BankAccount = z.CalculationOptions.BankAccountOffset ?? 0 + z.Entries.Where(e => e.Account == AccountType.BankAccount).Sum(e => e.Delta),
                    SavingsAccount = z.CalculationOptions.SavingsAccountOffset ?? 0 + z.Entries.Where(e => e.Account == AccountType.SavingsAccount).Sum(e => e.Delta)
                }));

                cfg.CreateMap<RecurringSheetEntry, RecurringSheetEntryListing>();

                cfg.CreateMap<Sheet, Models.DTO.Sheet>(MemberList.Destination)
                                 .ForMember(x => x.Offset, m => m.MapFrom<SheetOffsetCalculationResolver>())
                                 .ForMember(x => x.ApplicableTemplates, a => a.MapFrom(e => e.ApplicableTemplates.Select(x=>x.Template)));

                cfg.CreateMap<Models.DTO.Sheet, Sheet>(MemberList.Source)
                                 .ForSourceMember(x => x.Offset, m=>m.DoNotValidate())
                                 .ForSourceMember(x => x.ApplicableTemplates, m=>m.DoNotValidate())
                                 .ForMember(x => x.ApplicableTemplates, a => a.Ignore());

                cfg.CreateMap<AppUser, AppUserListing>(MemberList.Destination);

                cfg.CreateMap<SheetEntry, Models.DTO.SheetEntry>(MemberList.Destination)
                    .ForMember(x => x.CategoryId, m => m.MapFrom(x => x.Category.Id))
                    .ForMember(x => x.TemplateId, m => m.MapFrom(x => x.Template != null ? x.Template.Id : (int?)null))
                    .ForMember(x => x.IsNewSinceLastVisit, m => m.MapFrom<SheetEntryNewIndicatorConverter>());

                cfg.CreateMap<SheetEntry, Models.DTO.TagReportSheetEntry>(MemberList.Destination)
                    .ForMember(x => x.CategoryId, m => m.MapFrom(x => x.Category.Id))
                    .ForMember(x => x.TemplateId, m => m.MapFrom(x => x.Template != null ? x.Template.Id : (int?)null));

                cfg.CreateMap<RecurringSheetEntry, Models.DTO.RecurringSheetEntry>(MemberList.Destination)
                    .ForMember(x => x.CategoryId, m => m.MapFrom(x => x.Category.Id));


                cfg.CreateMap<Models.DTO.SheetEntry, SheetEntry>(MemberList.Source)
                    .ForSourceMember(x => x.IsNewSinceLastVisit, m => m.DoNotValidate());

                cfg.CreateMap<Models.DTO.RecurringSheetEntry, RecurringSheetEntry>(MemberList.Source);

                cfg.CreateMap<Tag,TagListing>(MemberList.Destination);
                cfg.CreateMap<TagListing,Tag>(MemberList.Source)
                   .ForMember(x => x.IsInactive, m=>m.Ignore());

                cfg.CreateMap<int, RecurringSheetEntry>().ConvertUsing<EntityResolver<RecurringSheetEntry>>();
                cfg.CreateMap<int?, RecurringSheetEntry>().ConvertUsing<EntityResolver<RecurringSheetEntry>>();

                cfg.CreateMap<int, SheetEntryTag>()
                   .ConvertUsing<SheetEntryTagConverter>();
                
                cfg.CreateMap<int, Tag>().ConvertUsing<EntityResolver<Tag>>();

                cfg.CreateMap<SheetEntryTag,int>().ConvertUsing(t => t.TagId);

                cfg.CreateMap<int, Category>().ConvertUsing<EntityResolver<Category>>();
            });

            config.AssertConfigurationIsValid();

            return config.CreateMapper();
        }

        public sealed class SheetEntryNewIndicatorConverter : IValueResolver<SheetEntry, Models.DTO.SheetEntry, bool>
        {
            public Boolean Resolve(
                SheetEntry source,
                Models.DTO.SheetEntry destination,
                bool destMember,
                ResolutionContext context
            )
            {
                PreviousSheetVisitMarker marker = context.GetPreviousSheetVisitMarker();

                return source.UpdateTimestamp > marker.LastVisitDate;
            }
        }


        public sealed class SheetEntryTagConverter : ITypeConverter<int, SheetEntryTag> {
            private readonly EntityResolver<Tag> _entityResolver;

            public SheetEntryTagConverter(EntityResolver<Tag> entityResolver) {
                this._entityResolver = entityResolver;
            }

            public SheetEntryTag Convert(int id, SheetEntryTag destination, ResolutionContext context) {
                Tag tag = this._entityResolver.Resolve(id, context);
                return new SheetEntryTag {
                    Tag = tag,
                    TagId = tag.Id
                };
            }
        }

        // ReSharper disable once ClassNeverInstantiated.Local -- It is instantiated, but using DI
        public sealed class EntityResolver<TEntity> : ITypeConverter<int, TEntity>, ITypeConverter<int?, TEntity> where TEntity : class, IHasId {
            private readonly HttpContext _httpContext;
            private readonly EntityOwnerService _entityOwnerService;

            private readonly DbSet<TEntity> _entities;

            /// <summary>
            /// Initializes a new instance of the <see cref="T:System.Object"/> class.
            /// </summary>
            public EntityResolver(DbContext dbContext, EntityOwnerService entityOwnerService, IHttpContextAccessor httpContextAccessor) {
                this._entityOwnerService = entityOwnerService;
                this._httpContext = httpContextAccessor.HttpContext;

                this._entities = dbContext.Set<TEntity>();
            }

            private TEntity ResolveCore(object sourceValue) {
                int? primaryKey = GetPrimaryKey(sourceValue);
                if (primaryKey == null) return null;

                TEntity result = this.FindEntityWithPermissionCheck(primaryKey.Value);
                return result;
            }

            private TEntity FindEntityWithPermissionCheck(int key) {
                TEntity entity = this.FindEntity(key);

                this.VerifyOwnership(entity as IAppOwnerEntity);

                return entity;
            }

            private void VerifyOwnership(IAppOwnerEntity appOwnerEntity) {
                if (appOwnerEntity == null) {
                    return;
                }

                int appOwnerId = GetAppOwnerId(this._httpContext);
                this._entityOwnerService.EnsureOwner(appOwnerEntity, appOwnerId);
            }

            private static int GetAppOwnerId(HttpContext context) {
                return context.User.Identity.GetOwnerGroupId();
            }

            private TEntity FindEntity(int key) {
                IQueryable<TEntity> query = this._entities;

                this.EagerLoadOwner(ref query);

                return query.FirstOrDefault(x => x.Id == key);
            }

            private void EagerLoadOwner(ref IQueryable<TEntity> query) {
                if (!typeof (IAppOwnerEntity).IsAssignableFrom(typeof (TEntity))) {
                    return;
                }

                ParameterExpression param = Expression.Parameter(typeof (TEntity), "e");
                MemberExpression ownerPropAccess = Expression.Property(param, nameof(IAppOwnerEntity.Owner));
                Expression<Func<TEntity, AppOwner>> propertyToEagerLoad = Expression.Lambda<Func<TEntity, AppOwner>>(ownerPropAccess, param);

                query = query.Include(propertyToEagerLoad);
            }

            private static int? GetPrimaryKey(object value) {
                var hasId = value as IHasId;
                if (hasId != null) {
                    return hasId.Id;
                }

                if (value == null) {
                    return null;
                }

                try {
                    return System.Convert.ToInt32(value, CultureInfo.InvariantCulture);
                }catch (InvalidCastException ex) {
                    throw new NotSupportedException("Cannot find PK", ex);
                }
            }


            public TEntity Resolve(int source, ResolutionContext context) {
                return this.ResolveCore(source);
            }

            public TEntity Convert(int source, ResolutionContext context) {
                return this.ResolveCore(source);
            }

            public TEntity Convert(int? source, TEntity destination, ResolutionContext context) {
                return this.ResolveCore(source);
            }

            public TEntity Convert(int source, TEntity destination, ResolutionContext context) {
                return this.ResolveCore(source);
            }
        }

        // ReSharper disable once ClassNeverInstantiated.Local -- It is instantiated, but using DI
        public sealed class SheetOffsetCalculationResolver : IValueResolver<Sheet, Models.DTO.Sheet, CalculationOptions> {
            private readonly SheetOffsetCalculationService _offsetCalculationService;

            public SheetOffsetCalculationResolver(SheetOffsetCalculationService offsetCalculationService) {
                this._offsetCalculationService = offsetCalculationService;
            }

            public CalculationOptions Resolve(Sheet source, Models.DTO.Sheet destination, CalculationOptions destMember, ResolutionContext context) {
                return this._offsetCalculationService.CalculateOffset(source);
            }
        }
    }
}
