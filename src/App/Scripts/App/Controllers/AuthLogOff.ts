/// <init-options route="/auth/logoff"/>
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../Services/AuthenticationService.ts"/>

module FinancialApp {

    export interface IAuthLogOffScope extends ng.IScope {
        confirm: IAction;
        isBusy: boolean;
    }

    export class AuthLogOffController {
        static $inject = ["$scope", "$location", "authentication"];

        constructor(private $scope: IAuthLogOffScope, private $location: ng.ILocationService, private authentication : Services.AuthenticationService) {
            if (!authentication.isAuthenticated()) {
                this.redirect();
                return;
            }

            $scope.confirm = () => this.confirmLogOff();
        }

        private confirmLogOff() {
            this.$scope.isBusy = true;
            this.authentication.logOff();
            this.redirect();
        }

        private redirect() {
            this.$location.path("/auth/login");
            this.$location.search({ uri: "/" });
            this.$location.replace();
        }
    }

}