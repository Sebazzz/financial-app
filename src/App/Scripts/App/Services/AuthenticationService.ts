/// <reference path="../Common.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>

module FinancialApp.Services {
    'use strict';

    export class AuthenticationInfo {
        constructor(
            public token : string = null, public userName: string = null) {
            
        }

        static create(dto: DTO.IAuthTokenInfo) {
            return new AuthenticationInfo(dto.access_token, dto.userName);
        }

        static createFromJson(json: string) {
            var raw = angular.fromJson(json);
            if (!raw) {
                return new AuthenticationInfo();
            }

            return new AuthenticationInfo(raw.token, raw.userName);
        }

        isAuthenticated() { return !!this.token; }
    }

    export class AuthenticationService {
        static $inject = ["$http", "$q", "$log", "$rootScope", "$location", "localStorage"];

        private authenticationChangedEvent: Delegate<IAction>;
        private authInfo: AuthenticationInfo;

        isCheckingAuthentication:boolean;

        constructor(private $http: ng.IHttpService,
                    private $q: ng.IQService,
                    private $log : ng.ILogService,
                    $rootScope: ng.IRootScopeService,
                    private $location: ng.ILocationService,
                    private localStorage: Storage) {

            this.authenticationChangedEvent = new Delegate<IAction>();

            this.authInfo = this.checkAuthentication();

            $rootScope.$on("$locationChangeStart", (ev : ng.IAngularEvent, newLocation : string) => {
                var isAuthorized = this.checkPathAuthorization(newLocation);
                if (!isAuthorized) {
                    ev.preventDefault();
                }
            });

            this.checkPathAuthorization();
        }

        private checkPathAuthorization(newLocation?: string): boolean {
            var location = newLocation || this.$location.path();
            var isLoginPage = location.indexOf("/auth/log") !== -1;

            if (!isLoginPage && !this.isAuthenticated()) {
                console.warn("Not logged in for path %s, redirecting...", location);

                this.$location.search({
                    uri: location
                });
                this.$location.path("/auth/login");
                this.$location.replace();
                return false;
            }

            return true;
        }

        public addAuthenticationChange(invokable: IAction) {
            this.authenticationChangedEvent.addListener(invokable);
        }

        public removeAuthenticationChange(invokable: IAction) {
            this.authenticationChangedEvent.removeListener(invokable);
        }

        public isAuthenticated() : boolean {
            return this.authInfo.isAuthenticated();
        }

        public logOff(): void {
            this.setAuthInfo(null);
            this.raiseAuthenticationEvent();
        }

        private raiseAuthenticationEvent() {
            this.authenticationChangedEvent.invoke((f) => { f(); return true; });

            if (!this.isAuthenticated()) {
                var currentPath = this.$location.path();
                var wasLoggedOff = false;
                if (currentPath === "/auth/login") {
                    currentPath = (this.$location.search() || {}).uri || "/";
                    wasLoggedOff = true;
                }

                this.$location.path("/auth/login");
                this.$location.replace();

                var loginArgs : any = {
                    uri: currentPath
                };
                if (wasLoggedOff) loginArgs.wasLoggedOff = true;

                this.$location.search(loginArgs);
            }
        }

        public authenticate(userName: string, password: string, persistent: boolean): ng.IPromise<DTO.IAuthenticationInfo> {
            var ret = this.$q.defer();

            var data = "grant_type=password&username=" + encodeURIComponent(userName) + "&password=" + encodeURIComponent(password);

            var opt: ng.IRequestShortcutConfig = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            this.$http.post<DTO.IAuthTokenInfo>("/api/token", data, opt).success((data) => {
                    data.userName = userName;

                    this.setAuthInfo(data);
                    this.raiseAuthenticationEvent();

                    ret.resolve(null);
                })
                .error((data, status) => {
                    this.setAuthInfo(null);
                    ret.reject(data);
                });

            return ret.promise;
        }

        public impersonate(userId: number, userName:string): ng.IPromise<DTO.IAuthenticationInfo>  {
            var ret = this.$q.defer();

            var data = "grant_type=impersonate&userid=" + userId + "&ticket=" + encodeURIComponent(this.authInfo.token);

            var opt: ng.IRequestShortcutConfig = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            this.$http.post<DTO.IAuthTokenInfo>("/api/token", data, opt).success((data) => {
                data.userName = userName;

                this.setAuthInfo(data);
                this.raiseAuthenticationEvent();

                ret.resolve(null);
            }).error((data, status) => ret.reject(data));

            return ret.promise;
        }

        private checkAuthentication(): AuthenticationInfo {
            // TODO: do an asynchronous real check here

            return this.getAuthInfo();
        }

        private setAuthInfo(obj: DTO.IAuthTokenInfo) {
            if (obj) {
                this.authInfo = AuthenticationInfo.create(obj);

                this.localStorage.setItem(AuthenticationService.localStorageLocation, angular.toJson(this.authInfo));
            } else {
                this.authInfo = new AuthenticationInfo();

                this.localStorage.removeItem(AuthenticationService.localStorageLocation);
            }
        }

        private getAuthInfo(): AuthenticationInfo {
            var authInfo = this.localStorage.getItem(AuthenticationService.localStorageLocation);

            if (!authInfo) {
                return new AuthenticationInfo();
            }

            return AuthenticationInfo.createFromJson(authInfo);
        }

        public getUserId(): number {
            return -1337;//this.authInfo.userId; // TODO: get user id
        }

        public getUserName(): string {
            return this.authInfo.userName || "???";
        }

        public static localStorageLocation = "AuthenticationToken";
    }

}