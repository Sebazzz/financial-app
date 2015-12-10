/// <init-options exclude="route"/>
/// <reference path="../Services/AuthenticationService.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>

module FinancialApp {
    'use strict';

    export interface IMasterControllerScope extends ng.IScope {
        isMenuVisible: boolean;
        isAuthenticated: boolean;
    }

    export class MasterController {
        public static $inject = ['$scope', 'authentication'];

        constructor($scope: IMasterControllerScope, private authentication: Services.AuthenticationService) {
            MasterController.setAuthenticationInfo($scope, this.authentication.isAuthenticated());

            this.authentication.addAuthenticationChange(() => MasterController.setAuthenticationInfo($scope, this.authentication.isAuthenticated()));
        }

        private static setAuthenticationInfo($scope: IMasterControllerScope, isAuthenticated : boolean): void {
            $scope.isMenuVisible = isAuthenticated;
            $scope.isAuthenticated = isAuthenticated;
        }
    }    
}