/// <init-options route="/manage/category"/>
/// <reference path="../../typings/angularjs/angular.d.ts" /> 

module FinancialApp {

    export interface ICategoryListControllerScope extends ng.IScope {
        // TODO: add items
    }

    export class CategoryListController {
        static $inject = ["$scope"];

        constructor($scope: ICategoryListControllerScope) {
            // TODO: init scope
        }
    }

}