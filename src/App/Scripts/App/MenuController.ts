/// <init-options exclude="route"/>
/// <reference path="../typings/angularjs/angular.d.ts"/>

module FinancialApp {

    export interface IMenuControllerScope extends ng.IScope {
        currentPath : string;
        nowPath: string;

        hasPath(str:string) : boolean;
    }

    export class MenuController {
        static $inject = ["$scope", "$location"];

        constructor($scope: IMenuControllerScope, $location: ng.ILocationService) {
            $scope.currentPath = $location.path();
            $scope.nowPath = Program.createNowRoute();

            $scope.hasPath = function(str: string): boolean {
                return str == this.currentPath;
            };

            $scope.$on("$locationChangeSuccess", () => {
                $scope.currentPath = $location.path();
            });
        }
    }

}