/// <init-options route="/manage/entry-template/add" viewName="RecurringSheetEntryEdit" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts" /> 
/// <reference path="../Common.ts"/>

module FinancialApp {
    
    'use strict';

    export interface IRecurringSheetEntryCreateScope extends ng.IScope {
        entry: IEditRecurringSheetEntry;
        categories: ng.resource.IResourceArray<DTO.ICategoryListing>;

        // copy enum
        // ReSharper disable once InconsistentNaming
        AccountType: typeof DTO.AccountType;

        saveEntry: IAction;
        cancel: IAction;
        isLoaded: boolean;
    }

    export class RecurringSheetEntryCreateController {
        public static $inject = ['$scope', '$location', '$modal', 'recurringSheetEntryResource', 'categoryResource'];

        private api: ng.resource.IResourceClass<DTO.IAppUserMutate>;

        constructor(private $scope: IRecurringSheetEntryCreateScope,
                    private $location: ng.ILocationService,
                    private $modal: ng.ui.bootstrap.IModalService,
                    private recurringSheetEntryResource: Factories.IWebResourceClass<DTO.IRecurringSheetEntry>,
                    categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>) {
            $scope.cancel = () => this.redirectToOverview();
            $scope.isLoaded = false;
            $scope.AccountType = DTO.AccountType;

            $scope.categories = categoryResource.query(() => {
                this.signalCategoriesLoaded();
            });

            $scope.entry = <IEditRecurringSheetEntry>{};

            $scope.saveEntry = () => this.saveEntry();
        }

        private redirectToOverview() {
            this.$location.path('/manage/entry-template/');
        }

        private saveEntry() {
            this.$scope.isLoaded = false;
            var res = <ng.resource.IResource<any>><any>this.recurringSheetEntryResource.save(this.$scope.entry);
            res.$promise.then((ret: DTO.IInsertId) => {
                this.redirectToOverview();
            });
            res.$promise['catch'](() => {
                this.$scope.isLoaded = true;
            });
        }

        private signalCategoriesLoaded() {
            this.$scope.isLoaded = true;
        }
    }
} 