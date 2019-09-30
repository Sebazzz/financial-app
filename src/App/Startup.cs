// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Startup.cs
//  Project         : App
// ******************************************************************************
using System.Data.Common;
using System.Diagnostics.CodeAnalysis;
using App.Support.Https;
using Microsoft.ApplicationInsights;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace App {
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Threading.Tasks;

    using Api.Extensions;

    using App.Models.Domain;
    using App.Models.Domain.Identity;
    using App.Support.Integration;
    using App.Support.Mailing;
    using Hangfire;
    using Hangfire.Dashboard;
    using Hangfire.MemoryStorage;
    using Jobs.DelayedSheetVisitUpdateMarker;
    using Jobs.MonthlyDigest;
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

    using Support;
    using Support.Filters;
    using Support.Hub;
    using Support.Setup;
    using Support.Setup.Steps;

    using Microsoft.Extensions.Hosting;
    using Models.DTO.Services;
    using Support.DataProtection;
    using Support.Diagnostics;
    using Support.Mapping;

    public class Startup {
        public Startup(IConfiguration env) {
            this.Configuration = env;
        }

        public IConfiguration Configuration { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        [SuppressMessage("ReSharper", "RedundantTypeArgumentsOfMethod")]
        public void ConfigureServices(IServiceCollection services) {
            if (!String.Equals(this.Configuration["DISABLE_TELEMETRY"], "True", StringComparison.OrdinalIgnoreCase)) {
                services.AddApplicationInsightsTelemetry(this.Configuration);
            }

            services.Configure<DatabaseOptions>(this.Configuration.GetSection("database"));
            services.Configure<ServerOptions>(this.Configuration.GetSection("server"));
            services.Configure<HttpsServerOptions>(this.Configuration.GetSection("server").GetSection("https"));
            services.Configure<MailSettings>(this.Configuration.GetSection("mail"));
            services.Configure<DiagnosticsOptions>(this.Configuration.GetSection("diagnostics"));

            services.AddResponseCompression(opts => {
                // Note the possible dangers for HTTPS: https://docs.microsoft.com/en-us/aspnet/core/performance/response-compression?tabs=aspnetcore2x#compression-with-secure-protocol
                opts.EnableForHttps = true;
            });

            services.AddConfiguredDataProtection(this.Configuration);

            services.AddMvc(options => {
                options.Filters.Add(typeof(HttpStatusExceptionFilterAttribute));
                options.Filters.Add(typeof(ModelStateCamelCaseFilter));
                options.Filters.Add(typeof(ApiCachePreventionFilterAttribute));
                options.Filters.Add(typeof(SetupRequiredFilterAttribute));
            }).SetCompatibilityVersion(CompatibilityVersion.Version_3_0);

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
                        var setupState = ctx.HttpContext.RequestServices.GetRequiredService<RequestAppSetupState>();

                        if (await setupState.HasBeenSetup()) {
                            await existingHandler(ctx);
                        }
                        else {
                            ctx.RejectPrincipal();
                        }
                    };
                }
            );

            services.AddAuthorization(opt => {
                opt.AddPolicy("AppSetup", policy => policy.AddRequirements(new SetupNotRunAuthorizationRequirement()));
            });

            services.AddSignalR()
                    .AddJsonProtocol();

            services.AddDbContext<AppDbContext>();

            services.AddHangfire(c => {
#if DEBUG
                c.UseMemoryStorage();
#else
                DatabaseOptions dbOptions = this.Configuration.GetSection("database").Get<DatabaseOptions>();
                c.UseSqlServerStorage(dbOptions.CreateConnectionString());
#endif
            });

            // DI
            services.AddScoped<AppDbContext>();
            services.AddScoped<DbContext>(sp => sp.GetRequiredService<AppDbContext>());
            services.AddScoped<DbConnection>(sp => sp.GetRequiredService<DbContext>().Database.GetDbConnection());
            services.AddScoped<AppUserManager>();
            services.AddScoped<AppUserStore>();

            services.AddScoped<AppOwnerRepository>();
            services.AddScoped<CategoryRepository>();
            services.AddScoped<RecurringSheetEntryRepository>();
            services.AddScoped<SheetEntryRepository>();
            services.AddScoped<SheetLastVisitedMarkerRepository>();
            services.AddScoped<SheetRepository>();
            services.AddScoped<TagRepository>();

            services.AddScoped<SheetRetrievalService>();
            services.AddScoped<EntityOwnerService>();
            services.AddScoped<SheetOffsetCalculationService>();
            services.AddScoped<SheetStatisticsService>();
            services.AddScoped<BudgetRetrievalService>();

            services.AddScoped<SheetLastVisitedMarkerService>();
            services.AddScoped<DelayedSheetVisitUpdateMarkerJob>();
            services.AddScoped<DelayedSheetVisitUpdateJobInvoker>();

            services.AddAutoMapper();

            services.AddSingleton<IAppVersionService, AppVersionService>();

            services.AddSingleton<IBuildAssetVersionCache, BuildAssetVersionCache>();

            // ... Impersonation
            services.AddScoped<AppUserTrustedUserRepository>();
            services.AddScoped<AppImpersonationTokenService>();
            services.AddScoped<AppOwnerTokenChangeService>();

            // ... Setup
            services.AddScoped<SetupService>();
            services.AddScoped<SetupStepFactory>();
            services.AddScoped<RequestAppSetupState>();
            services.AddSingleton<AppSetupState>();

            services.AddScoped<AuthenticationInfoFactory>();
            services.AddSingleton<IAuthorizationHandler, SetupNotRunAuthorizationHandler>();

            // ... Mail
            services.AddScoped<MailService>();
            services.AddScoped<TemplateProvider>();

            // Needed for TemplateProvider
            services.AddSingleton<ISiteUrlDetectionService, SiteUrlDetectionService>();

            // ... Mailers
            services.AddScoped<TwoFactorChangeNotificationMailer>();
            services.AddScoped<PasswordChangeNotificationMailer>();
            services.AddScoped<ForgotPasswordMailer>();
            services.AddScoped<ConfirmEmailMailer>();

            // ... Monthly digest
            services.AddScoped<MonthlyDigestInvocationJob>();
            services.AddScoped<MonthlyDigestForAppOwnerJob>();
            services.AddScoped<MonthlyDigestMailer>();
            services.AddScoped<MonthlyDigestDataFactory>();

            // ... App login notification
            services.AddScoped<AppUserLoginEventRepository>();
            services.AddScoped<AppUserLoginEventService>();
            services.AddScoped<AppUserLoginEventMailer>();

            // ... Startup health checks
            services.AddStartupChecks();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory, IWebHostEnvironment hostingEnvironment) {
            // Log hosting environment
            {
                ILogger logger = loggerFactory.CreateLogger("Startup");
                logger.LogInformation("Using content root: {0}", hostingEnvironment.ContentRootPath);
                logger.LogInformation("Using web root: {0}", hostingEnvironment.WebRootPath);
            }

            // Startup checks
            if (!app.RunStartupChecks()) {
                return;
            }

            // HTTP pipeline configuration
            app.UseHttps();
            app.UseMiddleware<SiteUrlDetectionService.Middleware>();

            app.UseRouting();
            app.UseAuthentication();

            if (env.IsDevelopment()) {
                app.UseDeveloperExceptionPage();

                app.UseWhen(
                    ctx => ctx.Request.Path.StartsWithSegments("/build") ||
                           ctx.Request.Path.StartsWithSegments("/sw-es5.js") ||
                           ctx.Request.Path.StartsWithSegments("/sw-es2017.js") ||
                           ctx.Request.Path.StartsWithSegments("/__webpack_hmr"),
                    spaApp => {
                        spaApp.UseSpa(spa => {
                            const int port = 8080;

                            Process.Start(new ProcessStartInfo {
                                FileName = "node.exe",
                                Arguments = $"dev-server.js --port={port}",
                                WorkingDirectory = hostingEnvironment.ContentRootPath,
                                UseShellExecute = true,
                                WindowStyle = ProcessWindowStyle.Minimized
                            });

                            spa.UseProxyToSpaDevelopmentServer($"http://localhost:{port}/");
                        });
                    }
                );
            }
            else {
                app.UseExceptionHandler("/");
            }

            app.UseResponseCompression();

            app.UseSimpleUrlRemap("/browserconfig.xml", "/images/tiles/manifest-microsoft.xml");
            app.UseSimpleUrlRemap("/sw-es5.js", "/build/es5/sw-es5.js");
            app.UseSimpleUrlRemap("/sw-es2017.js", "/build/es2017/sw-es2017.js");

            app.AddWildcardPatternRewrite("/build");

            app.UseStaticFiles(new StaticFileOptions {
                ContentTypeProvider = new FileExtensionContentTypeProvider {
                    // TODO: Remove when https://github.com/aspnet/AspNetCore/issues/2442 is done
                    Mappings = { [".webmanifest"] = "application/manifest+json" }
                },
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

                    string file = Path.Combine(env.WebRootPath, ".well-known", "acme-challenge", id);
                    await response.SendFileAsync(file);
                });
            });

            // Hangfire
            app.UseHangfireServer();
            app.UseHangfireDashboard("/_internal/jobs", new DashboardOptions {
                AppPath = "/",
                DisplayStorageConnectionString = false,
                Authorization = new IDashboardAuthorizationFilter[] {
                    new DiagnosticsHangfireDashboardAuthorizationFilter(),
                }
            });

            // SPA bootstrapper
            app.UseEndpoints(endpoints => {
                // SignalR hub
                endpoints.MapHub<AppOwnerHub>("/extern/connect/app-owner");

                // MVC api controllers
                endpoints.MapControllers();

                // If we still reached this at this point the ko-template was not found:
                // Trigger an failure instead of sending the app bootstrapper which causes all kinds of havoc.
                endpoints.MapFailedRoute("ko-templates/{*.}");
                endpoints.MapFailedRoute("build/{*.}");

                // Any non-matched web api calls should fail as well
                endpoints.MapFailedRoute("api/{*.}");

                // We only match one controller since we will want
                // all requests to go to the controller which renders
                // the initial view / SPA bootstrapper.
                endpoints.MapFallbackToController("{*.}", "Index", "Home");
            });

            // Configure recurring jobs
            AppInsightsJobFilterAttribute.Register(app.ApplicationServices.GetService<TelemetryClient>());
            RecurringJob.AddOrUpdate<MonthlyDigestInvocationJob>(x => x.Execute(), Cron.Daily(10));
        }
    }
}
