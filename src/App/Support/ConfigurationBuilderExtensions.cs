namespace App.Support {
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.Configuration;

    public static class ConfigurationBuilderExtensions {
        public static IConfigurationBuilder AddDevelopmentSecrets(this IConfigurationBuilder configurationBuilder, IHostingEnvironment env) {
            return env.IsDevelopment() ? configurationBuilder.AddUserSecrets() : configurationBuilder;
        }
    }
}