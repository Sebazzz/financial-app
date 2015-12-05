module FinancialApp.Factories {
    // ReSharper disable InconsistentNaming
    export function ApiCachingPreventionInterceptor() {
        var func = () => {
            return {
                request: cfg => {
                    var url: string = cfg.url;
                    if (url.toLowerCase().indexOf("angular/") === -1) {
                        //disable IE ajax request caching
                        cfg.headers['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';

                        // extra
                        cfg.headers['Cache-Control'] = 'no-cache';
                        cfg.headers['Pragma'] = 'no-cache';

                        return cfg;
                    }

                    return cfg; // return unmodified
                }
            };
        };

        return func.withInject();
    }
}