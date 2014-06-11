/// <init-options route="/manage/category"/>
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.ts"/>

module FinancialApp {

    export interface ICategoryListControllerScope extends ng.IScope {
        categories: DTO.ICategoryListing[];
        isLoaded: boolean;
    }

    export class CategoryListController {
        static $inject = ["$scope", "$resource"];

        private api: ng.resource.IResourceClass<DTO.ICategoryListing>;

        constructor($scope: ICategoryListControllerScope, $resource : ng.resource.IResourceService) {
            this.api = $resource<DTO.ICategoryListing>("/api/category/:id");

            $scope.categories = this.api.query(() => {
                $scope.isLoaded = true;
            });
        }
    }

}