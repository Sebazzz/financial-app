using Microsoft.AspNetCore.SpaServices.Webpack;

namespace App {
    using System;
    using System.Diagnostics;
    using System.Linq;
    using App.Models.Domain;
    using App.Models.Domain.Identity;
    using App.Support.Integration;
    using AutoMapper;
    using Microsoft.AspNetCore.Authentication.Cookies;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc.Formatters;
    using Microsoft.AspNetCore.Mvc.WebApiCompatShim;
    using Microsoft.AspNetCore.Routing;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Logging;
    using Models.Domain.Repositories;
    using Models.Domain.Services;
    using Newtonsoft.Json.Serialization;
    using Support;
    using Support.Filters;

    using LogLevel = Microsoft.Extensions.Logging.LogLevel;

    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            // Set up configuration sources.
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json")
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddApplicationInsightsSettings(developerMode:env.IsDevelopment())
                .AddEnvironmentVariables();

            this.Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services) {
            services.AddApplicationInsightsTelemetry(this.Configuration);

            services.AddMvc(options => {
                options.Filters.Add(typeof(HttpResponseExceptionActionFilter));
                options.Filters.Add(typeof(ModelStateCamelCaseFilter));
                options.Filters.Add(typeof(ApiCachePreventionFilterAttribute));
            }).AddWebApiConventions();

            services.AddIdentity<AppUser, AppRole>(
                    options => {
                        options.Password.RequireDigit = false;
                        options.Password.RequireLowercase = false;
                        options.Password.RequireNonAlphanumeric = false;
                    })
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders()
                .AddUserValidator<AppUserValidator>()
                .AddPasswordValidator<AppPasswordValidator>()
                .AddUserManager<AppUserManager>()
                .AddUserStore<AppUserStore>();

            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(opt => {
                        opt.LoginPath = new PathString("/Account/Login");
                        opt.ExpireTimeSpan = TimeSpan.FromDays(365 / 2d);
                        opt.SlidingExpiration = true;
                    });

            services.AddDbContextPool<AppDbContext>(options => options.UseSqlServer(this.Configuration["Data:AppDbConnection:ConnectionString"]));

#if SIGNALR
            services.AddSignalR(o => o.Hubs.EnableDetailedErrors = this._env.IsDevelopment());
            services.AddSingleton<JsonSerializer, SignalRJsonSerializer>();
#endif

            // DI
            services.AddScoped<AppDbContext>();
            services.AddScoped<DbContext>(sp => sp.GetRequiredService<AppDbContext>());
            services.AddScoped<AppUserManager>();
            services.AddScoped<AppUserStore>();

            services.AddTransient<AppOwnerRepository>();
            RepositoryRegistry.InsertIn(services);

            services.AddScoped<SheetRetrievalService>();
            services.AddScoped<EntityOwnerService>();
            services.AddScoped<SheetOffsetCalculationService>();
            services.AddScoped<SheetStatisticsService>();
            services.AddScoped<AutoMapperEngineFactory.SheetOffsetCalculationResolver>();
            services.AddScoped<AutoMapperEngineFactory.EntityResolver<Category>>();
            services.AddScoped<AutoMapperEngineFactory.EntityResolver<RecurringSheetEntry>>();
            
            services.AddSingleton<IMapper>(AutoMapperEngineFactory.Create);
            services.AddSingleton<IETagGenerator, ETagGenerator>();
            services.AddSingleton<IStaticFileUrlGenerator, StaticFileUrlGenerator>();
            services.AddSingleton<IAppVersionService, AppVersionService>();

            services.AddTransient<IBrowserDetector, DefaultBrowserDetector>();
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

            app.UseWebSockets();

            app.MapTemplateViewPath(env);

            app.UseAuthentication();

            if (env.IsDevelopment()) {
                app.UseBrowserLink();
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions {
                    HotModuleReplacement = true
                });
            } else {
                app.UseExceptionHandler("/");
            }

#if SIGNALR
            app.UseSignalR("/extern/signalr");
#endif

            app.UseWhen(
                ctx => ctx.Request.Path.StartsWithSegments(new PathString("/browserconfig.xml")),
                _ => _.Use((ctx, next) => {
                    ctx.Request.Path = "/images/tiles/manifest-microsoft.xml";
                    return next();
                }));

            app.UseStaticFiles();

            app.UseMvc(routes => {
                // If we still reached this at this point the ko-template was not found:
                // Trigger an failure instead of sending the app bootstrapper which causes all kinds of havoc.
                routes.MapFailedRoute("ko-templates/{*.}");

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
