module FinancialApp.Factories {
    // ReSharper disable InconsistentNaming
    export function AuthenticationErrorHttpInterceptor() {
        var func = (authentication : Services.AuthenticationService) => {
            return {
                responseError: (response) => {
                    if (response.status === 403) {
                        // unauthorized, cookie expired
                        authentication.logOff();
                    }
                }
            }
        };

        return func.withInject("authentication");
    }
}