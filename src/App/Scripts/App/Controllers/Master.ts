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
        static $inject = ["$scope", "$location", "authentication"];

        constructor($scope: IMasterControllerScope, private $location : ng.ILocationService, private authentication: Services.AuthenticationService) {
            $scope.$on("$locationChangeSuccess", (ev) => this.checkLocationAuthorization())

            MasterController.setAuthenticationInfo($scope, this.authentication.isAuthenticated());

            this.authentication.addAuthenticationChange(() => MasterController.setAuthenticationInfo($scope, this.authentication.isAuthenticated()));
            this.checkLocationAuthorization();
        }

        private static setAuthenticationInfo($scope: IMasterControllerScope, isAuthenticated : boolean): void {
            $scope.isMenuVisible = isAuthenticated;
            $scope.isAuthenticated = isAuthenticated;
        }

        private checkLocationAuthorization() {
            var isLoginPage = this.$location.path().indexOf("/auth/login") !== -1;

            if (!isLoginPage && !this.authentication.isAuthenticated()) {
                console.warn("Not logged in for path %s, redirecting...", this.$location.path());
                
                this.$location.search({
                    uri: this.$location.path()
                });
                this.$location.path("/auth/login");
                this.$location.replace();
            }
        }
    }    
}