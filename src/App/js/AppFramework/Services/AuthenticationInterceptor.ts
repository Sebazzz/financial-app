import * as http from '../ServerApi/HttpClient';
import AppContext from '../AppContext';

const authorizationRequiredHttpCode = 401;

function isAuthorizationRequiredRequest(xhr: Response) {
    if (!xhr) {
        return false;
    }

    return xhr.status === authorizationRequiredHttpCode;
}

class AuthenticationInterceptor implements http.IHttpInterceptor {
    constructor(private appContext: AppContext) {}

    public interceptRequest<T>(_: Request): http.RequestHandler<T> {
        return (requestInProgress: Promise<Response>) => {
            requestInProgress.then((xhr: Response) => {
                if (isAuthorizationRequiredRequest(xhr)) {
                    this.ensureRedirectToLogin();
                }
            });
        };
    }

    private ensureRedirectToLogin() {
        console.info('AuthenticationInterceptor: Request was denied. Redirecting.');

        this.appContext.router.cancel();

        const state = this.appContext.router.getState();
        const returnUrl = this.appContext.router.buildPath(state.name, state.params);
        this.appContext.router.navigate('auth.login', { returnUrl });
    }
}

export default function registerAuthenticationInterceptor(appContext: AppContext) {
    const interceptor = new AuthenticationInterceptor(appContext);
    http.default.registerInterceptor(interceptor);
}
