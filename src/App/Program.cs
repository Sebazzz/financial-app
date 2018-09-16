
using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using Microsoft.Extensions.Logging;

namespace App {
    using System.Net;

    using Microsoft.AspNetCore;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Server.Kestrel.Core;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;

    using App.Support.Https;

    public class Program {
        public static void Main(string[] args) {
            IWebHost host = 
                WebHost.CreateDefaultBuilder(args)
                       .ConfigureServices(ConfigureServerOptions)
                       .ConfigureAppConfiguration(cfg => cfg.AddApplicationInsightsSettings())
                       .ConfigureLogging((wc, logging) =>
                        {
                            var env = wc.HostingEnvironment;
                            var config = wc.Configuration;

                            logging.AddConfiguration(config.GetSection("Logging"));
                            logging.AddConsole();

                            if (env.IsDevelopment())
                            {
                                logging.AddDebug();
                            }
                            else
                            {
                                string file = config.GetSection("Logging").GetValue<string>("file");
                                
                                try {
                                    if (!string.IsNullOrEmpty(file))
                                    {
                                        logging.AddTraceSource(new SourceSwitch("Financial-App"),
                                                               new TextWriterTraceListener
                                                               {
                                                                   Writer = new StreamWriter(file, true, Encoding.UTF8)
                                                               });
                                    }
                                    else
                                    {
                                        logging.AddTraceSource(new SourceSwitch("Financial-App"),
                                                               new DefaultTraceListener());
                                    }
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine($"Failed to add file log to path [{file}]: {ex}");
                                }
                            }

                        })
                       .UseStartup<Startup>()
                       .Build();

            host.Run();
        }

        private static void ConfigureServerOptions(WebHostBuilderContext wc, IServiceCollection sc) {
            sc.Configure<KestrelServerOptions>(options => {
                options.AddServerHeader = false;
                options.UseSystemd();
                
                HttpsServerOptions httpsOptions = wc.Configuration.GetSection("server").GetSection("https").Get<HttpsServerOptions>();

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