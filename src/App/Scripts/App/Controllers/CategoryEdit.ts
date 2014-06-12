/// <init-options route="/manage/category/edit/:id" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.ts" /> 

module FinancialApp {

    export interface ICategoryEditScope extends ng.IScope {
        category: DTO.ICategory;
    }

    export class CategoryEditController {
        static $inject = ["$scope"];

        constructor($scope: ICategoryEditScope) {
            // TODO: init scope
        }
    }

}