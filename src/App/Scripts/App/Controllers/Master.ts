/// <init-options exclude="route"/>
/// <reference path="../Services/AuthenticationService.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>

module FinancialApp {
    export interface IMasterControllerScope extends ng.IScope {
        isMenuVisible: boolean;
        isAuthenticated: boolean;
    }

    export class MasterController {
        static $inject = ["$scope", "authentication"]

        private authentication: Services.AuthenticationService;

        constructor($scope: IMasterControllerScope, authentication: Services.AuthenticationService) {
            this.authentication = authentication;

            MasterController.setAuthenticationInfo($scope, this.authentication.isAuthenticated());

            this.authentication.addAuthenticationChange(() => MasterController.setAuthenticationInfo($scope, this.authentication.isAuthenticated()));
        }

        private static setAuthenticationInfo($scope: IMasterControllerScope, isAuthenticated : boolean): void {
            $scope.isMenuVisible = isAuthenticated;
            $scope.isAuthenticated = isAuthenticated;
        }
    }    
}