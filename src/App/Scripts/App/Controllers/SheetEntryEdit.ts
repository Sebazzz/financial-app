/// <init-options route="/sheet/:year/:month/entries/:id" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts" /> 
/// <reference path="../Common.ts"/>

module FinancialApp {
    
    'use strict';

    export interface ISheetEntryEditRouteParams extends ng.route.IRouteParamsService, IIdRouteParams {
        year: string;
        month: string;
    }

    export interface ISheetEntryCreateScope extends ng.IScope {
        entry: DTO.ISheetEntry;
        categories: ng.resource.IResourceArray<DTO.ICategoryListing>;

        // copy enum
        // ReSharper disable once InconsistentNaming
        AccountType: typeof DTO.AccountType;

        saveEntry: IAction;
        cancel: IAction;
        deleteEntry: IAction;
        isLoaded: boolean;
    }

    export class SheetEntryEditController {
        static $inject = ["$scope", "$location", "$routeParams", "$modal", "sheetEntryResource", "categoryResource"];

        private api: ng.resource.IResourceClass<DTO.IAppUserMutate>;

        constructor(private $scope: ISheetEntryCreateScope,
                    private $location: ng.ILocationService,
                    private $routeParams: ISheetEntryEditRouteParams,
                    private $modal: ng.ui.bootstrap.IModalService,
                    private sheetEntryResource: Factories.IWebResourceClass<DTO.ISheetEntry>,
                    categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>) {
            $scope.cancel = () => this.redirectToSheet();
            $scope.isLoaded = false;

            $scope.categories = categoryResource.query(() => {
                this.signalCategoriesLoaded();
            });

            $scope.entry = sheetEntryResource.get({
                sheetYear: $routeParams.year,
                sheetMonth: $routeParams.month,
                id: $routeParams.id
            }, () => this.signalEntryLoaded());

            $scope.deleteEntry = () => this.deleteEntry();
            $scope.saveEntry = () => this.saveEntry();
        }

        private redirectToSheet() {
            this.$location.path("/sheet/" + this.$routeParams.year + "/" + this.$routeParams.month);
        }

        private deleteEntry() {
            var res = ConfirmDialogController.create(this.$modal, {
                title: 'Regel verwijderen',
                bodyText: 'Weet je zeker dat je de regel wilt verwijderen?',
                dialogType: DialogType.Danger
            });

            res.result.then(() => this.deleteEntryCore());
        }

        private deleteEntryCore() {
            // server-side delete
            var params = {
                sheetMonth: this.$routeParams.month,
                sheetYear: this.$routeParams.year,
                id: this.$routeParams.id
            };

            this.sheetEntryResource['delete'](params, () => this.redirectToSheet());
        }

        private saveEntry() {
            var params = {
                sheetMonth: this.$routeParams.month,
                sheetYear: this.$routeParams.year,
                id: this.$routeParams.id
            };

            this.$scope.isLoaded = false;
            var res = <ng.resource.IResource<any>> <any> this.sheetEntryResource.update(params, this.$scope.entry);
            res.$promise.then(() => {
                this.redirectToSheet();
            });
            res.$promise['catch'](() => {
                this.$scope.isLoaded = true;
            });
        }

        private signalCategoriesLoaded() {
            if (this.$scope.entry.id) {
                this.$scope.isLoaded = true;
                this.$scope.entry.category = Enumerable.From(this.$scope.categories).FirstOrDefault(x => x.id == this.$scope.entry.categoryId);
            }
        }

        private signalEntryLoaded() {
            if (this.$scope.categories.$resolved) {
                this.$scope.isLoaded = true;
                this.$scope.entry.category = Enumerable.From(this.$scope.categories).FirstOrDefault(x => x.id == this.$scope.entry.categoryId);
            }
        }
    }
} 