import * as http from 'AppFramework/ServerApi/HttpClient';
import AppContext from 'AppFramework/AppContext';

const serviceNotAvailable = 503;
const reasonHeaderName = 'X-Reason', reasonHeaderValue = 'Setup';

function isSetupRequiredRequest(xhr: JQuery.jqXHR) {
    if (!xhr) {
        return false;
    }

    return xhr.status === serviceNotAvailable &&
           xhr.getResponseHeader(reasonHeaderName) === reasonHeaderValue;
}

class SetupInterceptor implements http.IHttpInterceptor {
    constructor(private appContext: AppContext) {}

    public interceptRequest<T>(request: JQuery.AjaxSettings): http.RequestHandler<T> {
        return (requestInProgress: Promise<T>) => {
            requestInProgress.catch((xhr: JQuery.jqXHR) => {
                if (isSetupRequiredRequest(xhr)) {
                    this.ensureRedirectToSetup();
                }
            });
        };
    }

    private ensureRedirectToSetup() {
        console.info('SetupInterceptor: Request identified as need-setup. Redirecting.');

        this.appContext.router.cancel();

        this.appContext.router.forward('default', 'setup');

        this.appContext.router.navigate('setup');
    }
}

export default function registerSetupInterceptor(appContext: AppContext) {
    appContext.authentication.addAnonymousRoute(/^\/setup($|\/)/);

    const interceptor = new SetupInterceptor(appContext);
    http.default.registerInterceptor(interceptor);
}
