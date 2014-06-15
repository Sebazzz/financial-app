/// <reference path="../Common.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>

module FinancialApp.Services {
    'use strict';

    class AuthenticationInfo implements DTO.IAuthenticationInfo {
        constructor(public isAuthenticated: boolean = false, public userId: number = 0, public userName: string = null) {
            
        }

        public static create($document: ng.IDocumentService): DTO.IAuthenticationInfo {
            var html = $document.find("html");

            return new AuthenticationInfo(
                html.data("auth") === "1",
                parseInt(html.data("auth-userid"), 10),
                html.data("auth-username") || null);
        }
    }

    export class AuthenticationService {
        static $inject = ["$document", "$http", "$q", "$rootScope", "$location"];

        private authenticationChangedEvent: Delegate<IAction>;
        private authInfo: DTO.IAuthenticationInfo;

        private $q: ng.IQService;
        private $http: ng.IHttpService;

        constructor($document: ng.IDocumentService, $http: ng.IHttpService, $q: ng.IQService, $rootScope : ng.IRootScopeService, $location : ng.ILocationService) {
            this.authenticationChangedEvent = new Delegate<IAction>();

            this.authInfo = AuthenticationInfo.create($document);

            $rootScope.$on("$locationChangeStart", (ev, newLocation : string) => {
                if (!this.authInfo.isAuthenticated && newLocation.indexOf('/auth/login') === -1) {
                    ev.preventDefault();
                }
            });

            if (!this.authInfo.isAuthenticated) {
                $location.path("/auth/login");
            }

            this.$q = $q;
            this.$http = $http;
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

        private raiseAuthenticationEvent() {
            this.authenticationChangedEvent.invoke((f) => { f(); return false; });
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
    }


}