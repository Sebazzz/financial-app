/// <reference path="../Common.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>

module FinancialApp.Services {
    'use strict';

    class AuthenticationInfo implements DTO.IAuthenticationInfo {
        constructor(public isAuthenticated: boolean = false, public userId: number = 0, public userName: string = null) {
            
        }
    }

    export class AuthenticationService {
        static $inject = ["$http", "$q", "$log", "$rootScope", "$location", "localStorage"];

        private authenticationChangedEvent: Delegate<IAction>;
        private authInfo: DTO.IAuthenticationInfo;

        isCheckingAuthentication:boolean;

        constructor(private $http: ng.IHttpService,
                    private $q: ng.IQService,
                    private $log : ng.ILogService,
                    $rootScope: ng.IRootScopeService,
                    $location: ng.ILocationService,
                    private localStorage: Storage) {

            this.authenticationChangedEvent = new Delegate<IAction>();

            this.authInfo = this.checkAuthentication();

            $rootScope.$on("$locationChangeStart", (ev : ng.IAngularEvent, newLocation : string) => {
                if (!this.authInfo.isAuthenticated && newLocation.indexOf('/auth/login') === -1) {
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
            return this.authInfo.isAuthenticated;
        }

        public logOff(): ng.IPromise<DTO.IAuthenticationInfo> {
            var ret = this.$q.defer();

            this.$http.post<DTO.IAuthenticationInfo>("/api/authentication/logoff", {}).success((data) => {
                this.authInfo = data;
                this.raiseAuthenticationEvent();

                ret.resolve(null);
            }).error((data) => ret.reject(data));

            return ret.promise;
        }

        private raiseAuthenticationEvent() {
            this.authenticationChangedEvent.invoke((f) => { f(); return true; });
        }

        public authenticate(userName: string, password: string, persistent: boolean): ng.IPromise<DTO.IAuthenticationInfo> {
            var ret = this.$q.defer();

            var postData = {
                userName: userName,
                password: password,
                persistent: persistent
            };

            this.$http.post<DTO.IAuthenticationInfo>("/api/authentication/login", postData).success((data) => {
                    this.authInfo = data;
                    this.raiseAuthenticationEvent();

                    ret.resolve(null);
                })
                .error((data, status) => ret.reject(data));

            return ret.promise;
        }

        private checkAuthentication(): DTO.IAuthenticationInfo {
            this.$log.info("AuthenticationService: Checking authentication");

            this.$http.get<DTO.IAuthenticationInfo>("/api/authentication/check")
                .success((info) => {
                    this.$log.log("AuthenticationService: Authentication information received");

                    this.setAuthInfo(info);
                    this.isCheckingAuthentication = false;
                    this.raiseAuthenticationEvent();
                });

            this.isCheckingAuthentication = true;

            return this.getAuthInfo();
        }

        private setAuthInfo(obj : DTO.IAuthenticationInfo) {
            if (obj) {
                this.localStorage.setItem("AuthenticationInfo", angular.toJson(obj));
            } else {
                this.localStorage.removeItem("AuthenticationInfo");
            }

            this.authInfo = obj;
        }

        private getAuthInfo(): DTO.IAuthenticationInfo {
            var authInfo = this.localStorage.getItem("AuthenticationInfo");

            if (!authInfo) {
                return new AuthenticationInfo(false, 0, "");
            }

            return angular.fromJson(authInfo);
        }
    }


}