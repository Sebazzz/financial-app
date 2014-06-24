module FinancialApp.Factories {
    // ReSharper disable InconsistentNaming
    export function AuthenticationErrorHttpInterceptor() {
        var func = ($location : ng.ILocationService) => {
            return {
                responseError: (response) => {
                    if (response.status === 403 || response.status === 401) {
                        // unauthorized, cookie expired
                        $location.path("/auth/login");
                    }

                    return response;
                }
            }
        };

        return func.withInject("$location");
    }
}