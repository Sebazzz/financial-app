module FinancialApp.Factories {
    // ReSharper disable InconsistentNaming
    export function AuthenticationErrorHttpInterceptor() {
        var func = ($q: ng.IDeferred<any>, $location: ng.ILocationService, localStorage: Storage) => {
            return {
                responseError: (response: ng.IHttpPromiseCallbackArg<any>) => {
                    var isUnauthorizedResponse = response.status === 403 || response.status === 401;
                    var isLoginPage = $location.path().indexOf("/auth/login") !== -1;

                    if (!isLoginPage && isUnauthorizedResponse) {
                        // unauthorized, cookie expired
                        $location.search({
                            uri: $location.path(),
                            logOff: true
                        });
                        $location.path("/auth/login");
                        $location.replace();
                    }

                    return $q.reject(response);
                }
            }
        };

        return func.withInject("$q", "$location", "localStorage");
    }
}