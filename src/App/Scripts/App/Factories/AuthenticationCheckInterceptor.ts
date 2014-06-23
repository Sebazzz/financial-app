module FinancialApp.Factories {
    // ReSharper disable InconsistentNaming
    export function AuthenticationErrorHttpInterceptor() {
        var func = ($location : ng.ILocationService) => {
            return {
                responseError: (response) => {
                    if (response.status === 403) {
                        // unauthorized, cookie expired
                        $location.path("/auth/login");
                    }
                }
            }
        };

        return func.withInject("$location");
    }
}