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
        static $inject = ["$document", "$rootScope", "$location"];

        private authenticationChangedEvent: Delegate<IAction>;
        private authInfo: DTO.IAuthenticationInfo;

        constructor($document: ng.IDocumentService, $rootScope : ng.IRootScopeService, $location : ng.ILocationService) {
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
    }


}