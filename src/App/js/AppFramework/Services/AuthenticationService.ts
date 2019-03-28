import * as ko from 'knockout';
import { Middleware, Router, State } from 'router5';
import { MiddlewareFactory } from 'router5/types/types/router';

import { trackLogin, trackLogout } from './Telemetry';
import * as auth from '../ServerApi/Authentication';

const defaultAuthInfo: auth.IAuthenticationInfo = {
    userId: 0,
    userName: null,
    isAuthenticated: false,
    isLockedOut: false,
    isTwoFactorAuthenticationRequired: false,
    previousActiveOwnedGroupId: null,
    currentGroupName: null,
    roles: []
};

const allowedRoutes = [/^\/auth\//i, /^\/hmr-proxy/i];

function middleware(router: Router, authenticationService: AuthenticationService): Middleware {
    return (toState: State) => {
        const path = toState.path,
            currentAuthenticationObservable = authenticationService.currentAuthentication,
            currentAuthenticationValue = currentAuthenticationObservable.peek();

        if (currentAuthenticationValue && currentAuthenticationValue.isAuthenticated) {
            return Promise.resolve(true);
        }

        for (const allowedRoute of allowedRoutes) {
            if (allowedRoute.test(path)) {
                console.log('AuthenticationMiddleware: Path %s allowed when not logged in', path);

                return Promise.resolve(true);
            }
        }

        // Not allowed - immediately reject
        const returnUrl = router.buildPath(toState.name, toState.params);
        console.log('AuthenticationMiddleware: Path %s rejected: not logged in', path);

        router.cancel();
        router.navigate('auth.login', { returnUrl });

        return Promise.reject<boolean>('unauthenticated');
    };
}

export default class AuthenticationService {
    private api = new auth.Api();

    public currentAuthentication = ko
        .observable<auth.IAuthenticationInfo>(AuthenticationService.getPersistedAuthenticationInfo() || defaultAuthInfo)
        .extend({ notify: 'always' });
    public isAuthenticated = ko.pureComputed(
        () => this.currentAuthentication() && this.currentAuthentication().isAuthenticated
    );

    public middleware: MiddlewareFactory = (router: Router) => middleware(router, this);

    public addAnonymousRoute(match: RegExp) {
        allowedRoutes.push(match);
    }

    public initialize(): void {
        this.autoPersistAuthenticationInfo();
        this.hookupTelemetry();
    }

    public async unauthenticate(): Promise<auth.IAuthenticationInfo> {
        const authInfo = await this.api.logoff();
        this.currentAuthentication(authInfo);
        return authInfo;
    }

    public checkAuthentication() {
        return new Promise<boolean>(resolve => {
            this.checkAuthenticationCore()
                .then(() => resolve(this.currentAuthentication.peek().isAuthenticated))
                .catch(() => resolve(false));
        });
    }

    public async authenticate(userName: string, password: string, persistent: boolean) {
        const loginInfo: auth.ILoginModel = {
            userName,
            password,
            persistent
        };

        const authInfo = await this.api.login(loginInfo);
        this.currentAuthentication(authInfo);
        return authInfo;
    }

    public async authenticateTwoFactor(verificationCode: string, persistent: boolean, rememberMachine: boolean) {
        const parameters: auth.ILoginTwoFactorAuthenticationModel = {
            verificationCode,
            isRecoveryCode: false,
            persistent,
            rememberClient: rememberMachine
        };

        const authInfo = await this.api.loginTwoFactorAuthentication(parameters);
        this.currentAuthentication(authInfo);
        return authInfo;
    }

    public async authenticateTwoFactorRecover(verificationCode: string) {
        const parameters: auth.ILoginTwoFactorAuthenticationModel = {
            verificationCode,
            isRecoveryCode: true,
            persistent: false,
            rememberClient: false
        };

        const authInfo = await this.api.loginTwoFactorAuthentication(parameters);
        this.currentAuthentication(authInfo);
        return authInfo;
    }

    public async impersonate(userId: number) {
        const authInfo = await this.api.impersonate(userId);
        this.currentAuthentication(authInfo);
        return authInfo;
    }

    public async changeActiveGroup(groupId: number) {
        const authInfo = await this.api.changeActiveGroup(groupId);
        this.currentAuthentication(authInfo);
        return authInfo;
    }

    private async checkAuthenticationCore() {
        console.log('AuthenticationService: Checking authentication');
        try {
            const authInfo = await this.api.check();
            this.currentAuthentication(authInfo);
        } finally {
            console.log(
                'AuthenticationService: Checked authentication, result: %s',
                this.currentAuthentication().isAuthenticated
            );
        }
    }

    private static persistedAuthInfoKey = 'app_currentAuthentication';

    // By persisting the authentication information, we can tell
    // in advance whether an user is authenticated or not
    private static getPersistedAuthenticationInfo(): auth.IAuthenticationInfo | null {
        try {
            const rawData = localStorage.getItem(this.persistedAuthInfoKey);
            if (!rawData) {
                return null;
            }

            return JSON.parse(rawData);
        } catch (e) {
            return null;
        }
    }

    private autoPersistAuthenticationInfo() {
        ko.computed(() => this.persistAuthenticationInfo(this.currentAuthentication()));
    }

    private persistAuthenticationInfo(authInfo: auth.IAuthenticationInfo) {
        console.log('AuthenticationService: Persisting authentication info');

        const json = JSON.stringify(authInfo);

        localStorage.setItem(AuthenticationService.persistedAuthInfoKey, json);
    }

    private hookupTelemetry() {
        ko.computed(() => {
            const authInfo = this.currentAuthentication();

            if (!authInfo || !authInfo.isAuthenticated) {
                trackLogout();
            } else {
                trackLogin(authInfo);
            }
        });
    }
}
