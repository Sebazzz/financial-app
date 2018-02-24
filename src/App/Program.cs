using App.Support.Https;

namespace App {
    using System;
    using System.Net;
    using System.Security.AccessControl;

    using Microsoft.AspNetCore;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Server.Kestrel.Core;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;

    public class Program {
        public static void Main(string[] args) {
            IWebHost host = 
                WebHost.CreateDefaultBuilder(args)
                       .ConfigureServices(ConfigureServerOptions)
                       .ConfigureAppConfiguration(cfg => cfg.AddApplicationInsightsSettings())
                       .UseKestrel()
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