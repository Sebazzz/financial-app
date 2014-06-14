/// <init-options route="/manage/category"/>
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../Common.ts"/>

module FinancialApp {

    export interface ICategoryListControllerScope extends ng.IScope {
        categories: DTO.ICategoryListing[];
        isLoaded: boolean;
        deleteCategory: IAction1<DTO.ICategoryListing>;
    }

    export class CategoryListController {
        static $inject = ["$scope", "categoryResource"];

        private api: ng.resource.IResourceClass<DTO.ICategoryListing>;

        constructor($scope: ICategoryListControllerScope, categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>) {
            this.api = categoryResource;

            $scope.categories = this.api.query(() => {
                $scope.isLoaded = true;
            });

            $scope.deleteCategory = (cat: DTO.ICategoryListing) => {
                if (cat.canBeDeleted === true) {
                    $scope.isLoaded = false;
                    this.api.delete({ id: cat.id }, () => {
                        $scope.isLoaded = true;
                        $scope.categories.remove(cat);
                    });
                }
            };
        }
    }

}