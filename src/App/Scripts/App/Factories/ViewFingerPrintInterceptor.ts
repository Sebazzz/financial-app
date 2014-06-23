module FinancialApp.Factories {
    // ReSharper disable InconsistentNaming
    export function ViewFingerPrintInterceptor() {
        var func = () => {
            return {
                request: cfg => {
                    var url: string = cfg.url;
                    if (url.toLowerCase().indexOf("/Angular/") === -1) {
                        return cfg; // return config unmodified
                    }

                    // TODO: add fingerprint
                    return cfg;
                }
            };
        };

        return func;
    }
}