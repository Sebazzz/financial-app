/// <init-options route="/manage/category/edit/:id" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 

module FinancialApp {

    export interface ICategoryEditScope extends ng.IScope {
        // TODO: add items
    }

    export class CategoryEditController {
        static $inject = ["$scope"];

        constructor($scope: ICategoryEditScope) {
            // TODO: init scope
        }
    }

}