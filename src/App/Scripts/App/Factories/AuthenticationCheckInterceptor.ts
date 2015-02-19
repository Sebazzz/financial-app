module FinancialApp.Factories {
    // ReSharper disable InconsistentNaming
    export function AuthenticationErrorHttpInterceptor() {
        var func = ($location : ng.ILocationService, $q : ng.IDeferred<any>) => {
            return {
                responseError: (response) => {
                    var isUnauthorizedResponse = response.status === 403 || response.status === 401;
                    var isLoginPage = this.$location.path().indexOf("/auth/login") !== -1;
                    if (!isLoginPage && isUnauthorizedResponse) {
                        // unauthorized, cookie expired
                        $location.search({
                            uri: $location.path()
                        });
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