module FinancialApp.Factories {
    // ReSharper disable InconsistentNaming
    export function ViewFingerPrintInterceptor() {
        var func = (appVersion) => {
            return {
                request: cfg => {
                    var url: string = cfg.url;
                    if (url.toLowerCase().indexOf("/Angular/") === -1) {
                        return cfg; // return config unmodified
                    }

                    // add fingerprint
                    url += "?v=" + appVersion;

                    cfg.url = url;
                    return cfg;
                }
            };
        };

        return func.withInject("appVersion");
    }
}