module FinancialApp.Factories {
    // ReSharper disable InconsistentNaming
    export function AuthenticationTokenInterceptor() {
        var func = (localStorage: Storage) => {
            return {
                request: (config : ng.IRequestConfig) => {
                    config.headers = config.headers || {};
                    
                    var rawAuthInfo = localStorage.getItem(Services.AuthenticationService.localStorageLocation);
                    var authInfo : Services.AuthenticationInfo;
                    if (rawAuthInfo && (authInfo = angular.fromJson(rawAuthInfo))) {
                        config.headers.Authorization = "Bearer " + authInfo.token;
                    }

                    return config;
                }
            }
        };

        return func.withInject("localStorage");
    }
}