/// <reference path="../Common.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>

module FinancialApp.Services {
    
    export class AuthenticationService {
        static $inject = ["$document", "$rootScope"];

        private isAuthenticatedBit: boolean;
        private authenticationChangedEvent: Delegate<IAction>;

        constructor($document: ng.IDocumentService, $rootScope : ng.IRootScopeService) {
            this.authenticationChangedEvent = new Delegate<IAction>();
            this.isAuthenticatedBit = AuthenticationService.checkDomAuthentication($document);

            $rootScope.$on("$locationChangeStart", (ev, newLocation : string) => {
                if (!this.isAuthenticatedBit && newLocation.indexOf('/auth/login') !== -1) {
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
            return this.isAuthenticatedBit;
        }

        private static checkDomAuthentication($document: ng.IDocumentService): boolean {
            return true; // TODO/STUB
        }
    }


}