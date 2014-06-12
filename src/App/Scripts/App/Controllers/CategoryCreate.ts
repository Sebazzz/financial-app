/// <init-options route="/manage/category/add" viewName="CategoryEdit" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.ts"/>

module FinancialApp {

    export interface ICategoryCreateScope extends ng.IScope {
        category: DTO.ICategory;
    }

    export class CategoryCreateController {
        static $inject = ["$scope"];

        constructor($scope: ICategoryCreateScope) {
            // TODO: init scope
        }
    }

}