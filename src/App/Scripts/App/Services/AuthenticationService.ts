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
                if (!this.authInfo.isAuthenticated() && newLocation.indexOf('/auth/login') === -1) {
                    ev.preventDefault();
                }
            });
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

        public logOff(): ng.IPromise<DTO.IAuthenticationInfo> {
            var ret = this.$q.defer();

            this.$http.post<DTO.IAuthTokenInfo>("/api/authentication/logoff", {}).success((data) => {
                this.setAuthInfo(null);
                this.raiseAuthenticationEvent();

                ret.resolve(null);
            }).error((data) => ret.reject(data));

            return ret.promise;
        }

        private raiseAuthenticationEvent() {
            this.authenticationChangedEvent.invoke((f) => { f(); return true; });

            if (!this.isAuthenticated()) {
                var currentPath = this.$location.path();
                this.$location.path("/auth/login");
                this.$location.replace();
                this.$location.search({
                    uri: currentPath != "/auth/login" ? currentPath : "/"
                });
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

        public impersonate(userId: number): ng.IPromise<DTO.IAuthenticationInfo>  {
            var ret = this.$q.defer();

            this.$http.post<DTO.IAuthTokenInfo>("/api/user/impersonate/" + userId, {}).success((data) => {
                this.setAuthInfo(data);
                this.raiseAuthenticationEvent();

                ret.resolve(null);
            }).error((data, status) => ret.reject(data));

            return ret.promise;
        }

        private checkAuthentication(): AuthenticationInfo {
            /*this.$log.info("AuthenticationService: Checking authentication");

            this.$http.get<DTO.IAuthenticationInfo>("/api/authentication/check")
                .success((info) => {
                    this.$log.log("AuthenticationService: Authentication information received");

                    this.setAuthInfo(info);
                    this.isCheckingAuthentication = false;
                    this.raiseAuthenticationEvent();
                });

            this.isCheckingAuthentication = true;*/

            return this.getAuthInfo();
        }

        private setAuthInfo(obj: DTO.IAuthTokenInfo) {
            if (obj) {
                this.authInfo = AuthenticationInfo.create(obj);

                this.localStorage.setItem("AuthenticationInfo2", angular.toJson(this.authInfo));
            } else {
                this.authInfo = new AuthenticationInfo();

                this.localStorage.removeItem("AuthenticationInfo2");
            }
        }

        private getAuthInfo(): AuthenticationInfo {
            var authInfo = this.localStorage.getItem("AuthenticationInfo2");

            if (!authInfo) {
                return new AuthenticationInfo();
            }

            return AuthenticationInfo.createFromJson(authInfo);
        }

        public getUserId(): number {
            return -1337;//this.authInfo.userId;
        }

        public getUserName(): string {
            return this.authInfo.userName;
        }
    }

}