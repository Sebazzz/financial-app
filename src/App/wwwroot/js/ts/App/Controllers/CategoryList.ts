/// <init-options route="/manage/category"/>
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../Common.ts"/>

module FinancialApp {
    'use strict';

    export interface ICategoryListControllerScope extends ng.IScope {
        categories: DTO.ICategoryListing[];
        isLoaded: boolean;
        deleteCategory: IAction1<DTO.ICategoryListing>;
    }

    export class CategoryListController {
        public static $inject = ['$scope', '$modal', 'categoryResource'];

        private api: ng.resource.IResourceClass<DTO.ICategoryListing>;

        constructor(private $scope: ICategoryListControllerScope,
                    private $modal: ng.ui.bootstrap.IModalService,
                            categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>) {
            this.api = categoryResource;

            $scope.categories = this.api.query(() => {
                $scope.isLoaded = true;
            });

            $scope.deleteCategory = (cat: DTO.ICategoryListing) => {
                this.deleteCategory(cat);
            };
        }

        private deleteCategory(cat: DTO.ICategoryListing) {
            if (cat.canBeDeleted !== true) {
                return;
            }

            var res = ConfirmDialogController.create(this.$modal, {
                title: 'Categorie verwijderen',
                bodyText: `Weet je zeker dat je de categorie "${cat.name}" wilt verwijderen?`,
                dialogType: DialogType.Danger
            });

            res.result.then(() => this.deleteCategoryCore(cat));
        }

        private deleteCategoryCore(cat: DTO.ICategoryListing) {
            this.$scope.isLoaded = false;
            this.api['delete']({ id: cat.id }, () => {
                this.$scope.isLoaded = true;
                this.$scope.categories.remove(cat);
            });
        }

    }

}