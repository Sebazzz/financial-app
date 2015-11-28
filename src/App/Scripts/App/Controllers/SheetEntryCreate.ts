/// <init-options route="/sheet/:year/:month/entries/add" viewName="SheetEntryEdit"/>
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts" /> 
/// <reference path="../Common.ts"/>

module FinancialApp {
    
    'use strict';

    export interface ISheetEntryCreateRouteParams extends ng.route.IRouteParamsService {
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

    export class SheetEntryCreateController {
        static $inject = ["$scope", "$location", "$routeParams", "sheetEntryResource", "categoryResource"];

        private api: ng.resource.IResourceClass<DTO.IAppUserMutate>;

        constructor(private $scope: ISheetEntryCreateScope,
                    private $location: ng.ILocationService,
                    private $routeParams: ISheetEntryCreateRouteParams,
                    private sheetEntryResource: Factories.IWebResourceClass<DTO.ISheetEntry>,
                    categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>) {
            $scope.cancel = () => this.redirectToSheet();
            $scope.isLoaded = false;
            $scope.AccountType = DTO.AccountType;

            $scope.entry = <DTO.ISheetEntry> {};
            $scope.entry.account = DTO.AccountType.BankAccount;

            $scope.categories = categoryResource.query(() => {
                $scope.isLoaded = true;
            });

            $scope.saveEntry = () => this.saveEntry();
        }

        private redirectToSheet() {
            this.$location.path("/sheet/" + this.$routeParams.year + "/" + this.$routeParams.month);
            this.$location.replace();
        }

        private saveEntry() {
            var params = {
                sheetMonth: this.$routeParams.month,
                sheetYear: this.$routeParams.year
            };

            this.$scope.entry.categoryId = this.$scope.entry.category.id;
            this.$scope.isLoaded = false;

            var res = <ng.resource.IResource<any>> <any> this.sheetEntryResource.save(params, this.$scope.entry);
            res.$promise.then(() => {
                this.redirectToSheet();
            });
            res.$promise['catch'](() => {
                this.$scope.isLoaded = true;
            });
        }
    }
} 