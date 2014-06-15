/// <init-options exclude="route"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../Services/AuthenticationService.ts"/>

module FinancialApp {
    'use strict';

    export interface IMenuControllerScope extends ng.IScope {
        currentPath : string;
        nowPath: string;

        hasPath(str: string): boolean;

        extendMenuVisible: boolean;
        toggleNavBar: IAction;
    }

    export class MenuController {
        static $inject = ["$scope", "$location"];

        constructor($scope: IMenuControllerScope, $location: ng.ILocationService) {
            $scope.currentPath = $location.path();
            $scope.nowPath = Program.createNowRoute();
            $scope.extendMenuVisible = false;

            $scope.hasPath = function(str: string): boolean {
                return str == this.currentPath;
            };

            $scope.$on("$locationChangeSuccess", () => {
                $scope.currentPath = $location.path();
            });

            $scope.toggleNavBar = () => $scope.extendMenuVisible = !$scope.extendMenuVisible;
        }
    }

}