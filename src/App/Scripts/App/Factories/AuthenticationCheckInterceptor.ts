module FinancialApp.Factories {
    // ReSharper disable InconsistentNaming
    export function AuthenticationErrorHttpInterceptor() {
        var func = ($location : ng.ILocationService, $q : ng.IDeferred<any>) => {
            return {
                responseError: (response) => {
                    if (response.status === 403 || response.status === 401) {
                        // unauthorized, cookie expired
                        $location.path("/auth/login");
                        $location.replace();
                    }

                    return response;
                }
            }
        };

        return func.withInject("$location", "$q");
    }
}