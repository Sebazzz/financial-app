using System.Data.Common;
using System.Diagnostics.CodeAnalysis;
using App.Support.Https;

namespace App {
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Threading.Tasks;

    using Api.Extensions;

    using App.Models.Domain;
    using App.Models.Domain.Identity;
    using App.Support.Integration;
    using AutoMapper;
    using Microsoft.AspNetCore.Authentication.Cookies;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Http.Headers;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Routing;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Logging;
    using Microsoft.Net.Http.Headers;

    using Models.Domain.Repositories;
    using Models.Domain.Services;

    using Newtonsoft.Json.Serialization;

    using Support;
    using Support.Filters;
    using Support.Hub;
    using Support.Setup;
    using Support.Setup.Steps;

    using LogLevel = Microsoft.Extensions.Logging.LogLevel;
    using Microsoft.AspNetCore.SpaServices.Webpack;
    public class Startup
    {
        public Startup(IConfiguration env)
        {
            this.Configuration = env;
        }

        public IConfiguration Configuration { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        [SuppressMessage("ReSharper", "RedundantTypeArgumentsOfMethod")]
        public void ConfigureServices(IServiceCollection services) {
            if (!String.Equals(this.Configuration["DISABLE_TELEMETRY"], "True", StringComparison.OrdinalIgnoreCase)) {
                services.AddApplicationInsightsTelemetry(this.Configuration);
            }

            services.Configure<HttpsServerOptions>(Configuration.GetSection("server").GetSection("https"));

            services.AddResponseCompression();

            services.AddMvc(options => {
                options.Filters.Add(typeof(HttpStatusExceptionFilterAttribute));
                options.Filters.Add(typeof(ModelStateCamelCaseFilter));
                options.Filters.Add(typeof(ApiCachePreventionFilterAttribute));
                options.Filters.Add(typeof(SetupRequiredFilterAttribute));
            });

            services.AddIdentity<AppUser, AppRole>(
                    options => {
                        options.Password.RequireDigit = false;
                        options.Password.RequireLowercase = false;
                        options.Password.RequireNonAlphanumeric = false;

                        options.Lockout.AllowedForNewUsers = true;
                        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
                        options.Lockout.MaxFailedAccessAttempts = 5;

                    })
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders()
                .AddUserValidator<AppUserValidator>()
                .AddRoleValidator<AppRoleValidator>()
                .AddPasswordValidator<AppPasswordValidator>()
                .AddUserManager<AppUserManager>()
                .AddRoleManager<AppRoleManager>()
                .AddUserStore<AppUserStore>()
                .AddRoleStore<AppRoleStore>();

            services.ConfigureApplicationCookie(
                opt => {
                    opt.LoginPath = new PathString("/Account/Login");
                    opt.ExpireTimeSpan = TimeSpan.FromDays(365 / 2d);
                    opt.SlidingExpiration = true;

                    // Override cookie validator until setup has been completed
                    Func<CookieValidatePrincipalContext, Task> existingHandler = opt.Events.OnValidatePrincipal;
                    opt.Events.OnValidatePrincipal = async (ctx) => {
                        RequestAppSetupState setupState = ctx.HttpContext.RequestServices.GetRequiredService<RequestAppSetupState>();

                        if (await setupState.HasBeenSetup()) {
                            await existingHandler(ctx);
                        } else {
                            ctx.RejectPrincipal();
                        }
                    };
                }
            );

            services.AddAuthorization(opt => {
                opt.AddPolicy("AppSetup", policy => policy.AddRequirements(new SetupNotRunAuthorizationRequirement()));
            });

            services.AddDbContextPool<AppDbContext>(options => options.UseSqlServer(this.Configuration["Data:AppDbConnection:ConnectionString"]));

            services.AddSignalR(options => options.JsonSerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver());

            // DI
            services.AddScoped<AppDbContext>();
            services.AddScoped<DbContext>(sp => sp.GetRequiredService<AppDbContext>());
            services.AddScoped<DbConnection>(sp => sp.GetRequiredService<DbContext>().Database.GetDbConnection());
            services.AddScoped<AppUserManager>();
            services.AddScoped<AppUserStore>();

            services.AddTransient<AppOwnerRepository>();
            RepositoryRegistry.InsertIn(services);

            services.AddScoped<SheetRetrievalService>();
            services.AddScoped<EntityOwnerService>();
            services.AddScoped<SheetOffsetCalculationService>();
            services.AddScoped<SheetStatisticsService>();
            services.AddScoped<BudgetRetrievalService>();
            services.AddScoped<AutoMapperEngineFactory.SheetOffsetCalculationResolver>();
            services.AddScoped<AutoMapperEngineFactory.EntityResolver<Category>>();
            services.AddScoped<AutoMapperEngineFactory.EntityResolver<RecurringSheetEntry>>();
            services.AddScoped<AutoMapperEngineFactory.EntityResolver<Tag>>();
            services.AddScoped<AutoMapperEngineFactory.SheetEntryTagConverter>();
            
            services.AddSingleton<IMapper>(AutoMapperEngineFactory.Create);
            services.AddSingleton<IAppVersionService, AppVersionService>();

            services.AddScoped<SetupService>();
            services.AddScoped<SetupStepFactory>();
            services.AddScoped<RequestAppSetupState>();
            services.AddSingleton<AppSetupState>();

            services.AddSingleton<IAuthorizationHandler, SetupNotRunAuthorizationHandler>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(this.Configuration.GetSection("Logging"));
            
            if (env.IsDevelopment()) {
                loggerFactory.AddDebug(LogLevel.Debug);
            } else {
                loggerFactory.AddTraceSource(new SourceSwitch("Financial-App"), new DefaultTraceListener());
            }

            app.UseHttps();

            app.UseAuthentication();

            if (env.IsDevelopment()) {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions {
                    HotModuleReplacement = true
                });
            } else {
                app.UseExceptionHandler("/");
            }

            app.UseSignalR(builder => {
                builder.MapHub<AppOwnerHub>("extern/connect/app-owner");
            });

            app.UseResponseCompression();

            app.UseWhen(
                ctx => ctx.Request.Path.StartsWithSegments(new PathString("/browserconfig.xml")),
                _ => _.Use((ctx, next) => {
                    ctx.Request.Path = "/images/tiles/manifest-microsoft.xml";
                    return next();
                }));

            app.UseWhen(
                ctx => ctx.Request.Path.StartsWithSegments(new PathString("/sw.js")),
                _ => _.Use((ctx, next) => {
                    ctx.Request.Path = "/build/sw.js";
                    return next();
                }));
            
            app.UseStaticFiles(new StaticFileOptions {
                OnPrepareResponse = context => {
                    // Enable aggressive caching behavior - but be sure that requests from service workers must be properly addressed
                    const int expireTimeInDays = 7 * 4;

                    ResponseHeaders headers = context.Context.Response.GetTypedHeaders();
                    headers.Expires = DateTimeOffset.Now.AddDays(expireTimeInDays);
                    headers.CacheControl = new CacheControlHeaderValue {
                        MaxAge = TimeSpan.FromDays(expireTimeInDays),
                        MustRevalidate = true,
                        Public = true,
                        MaxStale = true,
                        MaxStaleLimit = TimeSpan.FromSeconds(5)
                    };
                }
            });

            // Let's encrypt support
            app.UseRouter(r => {
                r.MapGet(".well-known/acme-challenge/{id}", async (request, response, routeData) => {
                    string id = routeData.Values["id"] as string;
                    if (id != Path.GetFileName(id)) {
                        return; // Prevent injection attack
                    }

                    string file = Path.Combine(env.WebRootPath, ".well-known","acme-challenge", id);
                    await response.SendFileAsync(file);
                });
            });

            app.UseMvc(routes => {
                // If we still reached this at this point the ko-template was not found:
                // Trigger an failure instead of sending the app bootstrapper which causes all kinds of havoc.
                routes.MapFailedRoute("ko-templates/{*.}");
                routes.MapFailedRoute("build/{*.}");

                // Any non-matched web api calls should fail as well
                routes.MapFailedRoute("api/{*.}");


                // We only match one controller since we will want
                // all requests to go to the controller which renders
                // the initial view.
                
                routes.MapRoute(
                    name: "default",
                    template: "{*.}",
                    defaults: new {
                        controller = "Home",
                        action = "Index"
                    });
            });
        }
    }
}
