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
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Logging;
    using Models.Domain.Repositories;
    using Models.Domain.Services;
    using Newtonsoft.Json.Serialization;
    using Support;
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
                .AddDevelopmentSecrets(env)
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
            }).AddWebApiConventions();

            services.AddIdentity<AppUser, AppRole>(
                    options => {
                        options.Password.RequireDigit = false;
                        options.Password.RequireLowercase = false;
                        options.Password.RequireNonAlphanumeric = false;
                    })
                .AddEntityFrameworkStores<AppDbContext, int>()
                .AddDefaultTokenProviders()
                .AddUserValidator<AppUserValidator>()
                .AddPasswordValidator<AppPasswordValidator>()
                .AddUserManager<AppUserManager>()
                .AddUserStore<AppUserStore>();

            services.AddDbContext<AppDbContext>(options => options.UseSqlServer(this.Configuration["Data:AppDbConnection:ConnectionString"]));

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

            app.MapApplicationCacheManifest();
            app.MapAngularViewPath(env);

            app.UseCookieAuthentication(new CookieAuthenticationOptions {
                LoginPath = new PathString("/Account/Login"),
                ExpireTimeSpan = TimeSpan.FromDays(365 / 2d),
                SlidingExpiration = true,

                AutomaticAuthenticate = true,
                AutomaticChallenge = true,
                AuthenticationScheme = new IdentityCookieOptions().ApplicationCookieAuthenticationScheme
            });

            if (env.IsDevelopment()) {
                app.UseBrowserLink();
                app.UseDeveloperExceptionPage();
            } else {
                app.UseExceptionHandler("/");
            }

#if SIGNALR
            app.UseSignalR("/extern/signalr");
#endif

            app.UseStaticFiles();

            app.UseMvc(routes => {
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
