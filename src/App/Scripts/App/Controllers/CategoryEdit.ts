/// <init-options route="/manage/category/edit/:id" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.ts" /> 
/// <reference path="../Common.ts"/>

module FinancialApp {

    export interface ICategoryEditScope extends ng.IScope {
        category: DTO.ICategory;
        save: IAction;
    }

    export class CategoryEditController {
        static $inject = ["$scope", "$routeParams", "$location", "categoryResource"];

        private api: ng.resource.IResourceClass<DTO.ICategory>;

        constructor($scope: ICategoryEditScope, $routeParams: IIdRouteParams, $location : ng.ILocationService, categoryResource: ng.resource.IResourceClass<DTO.ICategory>) {
            this.api = categoryResource;

            $scope.category = this.api.get({ id: $routeParams.id }, () => { }, () => $location.path("/manage/category"));
            $scope.save = () => this.api.save($scope.category, () => $location.path("/manage/category"));
        }
    }

}