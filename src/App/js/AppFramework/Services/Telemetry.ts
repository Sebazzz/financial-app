import { Router, Plugin as RouterPlugin, PluginFactory, State } from 'router5';
import { RouterUtils } from 'AppFramework/Navigation/Page';

import * as auth from '../ServerApi/Authentication';

function applicationInsightsAvailable(): boolean {
    return 'appInsights' in window;
}

class TelemetryPlugin implements RouterPlugin {
    private currentTimestamp: number | undefined;

    constructor(private appInsights: Microsoft.ApplicationInsights.IAppInsights, private router: Router) {
        this.onTransitionStart = this.onTransitionStart.bind(this);
        this.onTransitionSuccess = this.onTransitionSuccess.bind(this);
        this.onTransitionError = this.onTransitionError.bind(this);
    }

    public onTransitionStart(): void {
        this.currentTimestamp = performance.now();
    }

    public onTransitionSuccess(): void {
        const duration =
            typeof this.currentTimestamp !== 'undefined' ? performance.now() - this.currentTimestamp : undefined;

        const page = RouterUtils.getPage(this.router);
        if (!page) {
            this.appInsights.trackPageView(undefined, undefined, undefined, undefined, duration);
        } else {
            this.appInsights.trackPageView(page.title.peek(), undefined, undefined, undefined, duration);
        }
    }

    public onTransitionError(toState: State, fromState: State, err?: any): void {
        this.appInsights.trackException(err, toState.name);
    }
}

const plugin: PluginFactory = ((router: Router): RouterPlugin => {
    if (!applicationInsightsAvailable()) {
        // Telemetry not available - cancel
        return {};
    }

    return new TelemetryPlugin(appInsights, router);
}) as PluginFactory;

export const telemetryPlugin = plugin;

export function trackLogin(info: auth.IAuthenticationInfo) {
    if (!applicationInsightsAvailable() || !info.isAuthenticated) {
        return;
    }

    appInsights.setAuthenticatedUserContext(info.userId.toString());
}

export function trackLogout() {
    if (!applicationInsightsAvailable()) {
        return;
    }

    appInsights.clearAuthenticatedUserContext();
}

export function trackBindingFrameworkException(error: Error) {
    if (!applicationInsightsAvailable()) {
        return;
    }

    appInsights.trackException(error, 'knockout', {
        bindingFrameworkError: 'yes',
        location: document.location!.href,
        documentTitle: document.title
    });
}
