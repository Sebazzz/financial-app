// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppBuilderExtensions.cs
//  Project         : App
// ******************************************************************************

namespace App.Support.Mapping
{
    using Microsoft.Extensions.DependencyInjection;
    using Models.Domain;

    public static class AppBuilderExtensions
    {
        public static void AddAutoMapper(this IServiceCollection services)
        {
            services.AddSingleton(AutoMapperEngineFactory.Create);

            services.AddScoped<AutoMapperEngineFactory.SheetOffsetCalculationResolver>();
            services.AddScoped<AutoMapperEngineFactory.EntityResolver<Category>>();
            services.AddScoped<AutoMapperEngineFactory.EntityResolver<RecurringSheetEntry>>();
            services.AddScoped<AutoMapperEngineFactory.EntityResolver<Tag>>();
            services.AddScoped<AutoMapperEngineFactory.SheetEntryTagConverter>();
            services.AddSingleton<AutoMapperEngineFactory.SheetEntryNewIndicatorConverter>();
        }
    }
}
