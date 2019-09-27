// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Program.cs 
//  Project         : App 
// ******************************************************************************
namespace App {

    using System;
    using System.IO;
    using Microsoft.Extensions.Logging;

    using System.Net;

    using Microsoft.AspNetCore;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Server.Kestrel.Core;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;

    using App.Support.Https;
    using Microsoft.Extensions.Hosting;
    using Support;

    internal static class Program {
        public static void Main(string[] args) {
            Console.WriteLine($"Financial App - v{AppVersionService.GetInformationalVersion()}");
            Console.WriteLine($"Starting at {DateTime.Now:s}");

            Console.WriteLine();
            Console.WriteLine("Configuring web host...");

            IWebHost host = BuildWebHost(args);

            Console.WriteLine();
            Console.WriteLine("Starting host...");
            host.Run();
        }

        private static IWebHost BuildWebHost(string[] args) {
            IWebHost host =
                WebHost.CreateDefaultBuilder(args)
                    .ConfigureServices(ConfigureServerOptions)
                    .ConfigureAppConfiguration(cfg => cfg.AddApplicationInsightsSettings())
                    .ConfigureAppConfiguration(cfg => {
                        if (Environment.GetEnvironmentVariable("ASPNETCORE_FORCE_USERSECRETS") == "True") {
                            cfg.AddUserSecrets(typeof(Program).Assembly);
                        }

                        cfg.AddOperatingSpecificConfigurationFolders();
                    })
                    .ConfigureLogging((wc, logging) => {
                        var env = wc.HostingEnvironment;
                        var config = wc.Configuration;

                        Console.WriteLine($"Current environment: {env.EnvironmentName}");

                        logging.AddConfiguration(config.GetSection("Logging"));
                        logging.AddConsole();

                        if (env.IsDevelopment()) {
                            logging.AddDebug();
                        }
                        else {
                            logging.AddApplicationInsights();

                            var fileSection = config.GetSection("Logging").GetSection("File");
                            var fileName = fileSection?.GetValue<string>("Path");

                            if (!string.IsNullOrEmpty(fileName)) {
                                try {
                                    logging.AddFile(fileSection);
                                }
                                catch (Exception ex) {
                                    Console.WriteLine($"Failed to add file log to path [{fileName}]: {ex}");
                                }
                            }
                            else {
                                Console.WriteLine("Skipping file logging...");
                            }
                        }
                    })
                    .UseStartup<Startup>()
                    .Build();
            return host;
        }

        private static void AddOperatingSpecificConfigurationFolders([NotNull] this IConfigurationBuilder cfg) {
            if (cfg == null) throw new ArgumentNullException(nameof(cfg));

            const string configFileName = "config";
            const string iniFileExt = "ini";
            const string jsonFileExt = "json";

            string MakeFilePath(string extension) {
                return EmitConfigSearchMessage(EnvironmentPath.CreatePath(Path.ChangeExtension(configFileName, extension)));
            }

            string EmitConfigSearchMessage(string path) {
                Console.WriteLine("\tLoading configuration from: {0}", path);
                return path;
            }

            cfg.AddJsonFile(MakeFilePath(jsonFileExt), true);
            cfg.AddIniFile(MakeFilePath(iniFileExt), true);
        }

        private static void ConfigureServerOptions(WebHostBuilderContext wc, IServiceCollection sc) {
            sc.Configure<KestrelServerOptions>(options => {
                options.AddServerHeader = false;
                options.UseSystemd();

                var httpsOptions = wc.Configuration.GetSection("server").GetSection("https").Get<HttpsServerOptions>();

                if (httpsOptions?.CertificatePath != null) {
                    options.Listen(IPAddress.Any, 80);
                    options.Listen(IPAddress.Any, 443, opts => {
                        opts.UseHttps(httpsOptions.CertificatePath, httpsOptions.CertificatePassword);
                    });
                }
            });
        }
    }
}
