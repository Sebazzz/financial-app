/// <init-options route="/manage/category"/>
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.ts"/>

module FinancialApp {

    export interface ICategoryListControllerScope extends ng.IScope {
        categories: DTO.ICategoryListing[];
        isLoaded: boolean;
    }

    export class CategoryListController {
        static $inject = ["$scope", "categoryResource"];

        private api: ng.resource.IResourceClass<DTO.ICategoryListing>;

        constructor($scope: ICategoryListControllerScope, categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>) {
            this.api = categoryResource;

            $scope.categories = this.api.query(() => {
                $scope.isLoaded = true;
            });
        }
    }

}