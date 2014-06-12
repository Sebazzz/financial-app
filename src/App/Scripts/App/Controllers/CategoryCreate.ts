/// <init-options route="/manage/category/add" viewName="CategoryEdit" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 

module FinancialApp {

    export interface ICategoryCreateScope extends ng.IScope {
        // TODO: add items
    }

    export class CategoryCreateController {
        static $inject = ["$scope"];

        constructor($scope: ICategoryCreateScope) {
            // TODO: init scope
        }
    }

}