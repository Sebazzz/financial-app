/// <init-options route="/manage/entry-template/edit/:id" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts" /> 
/// <reference path="../Common.ts"/>

module FinancialApp {
    
    'use strict';

    export interface IRecurringSheetEntryEditRouteParams extends ng.route.IRouteParamsService, IIdRouteParams {
    }

    export interface IEditRecurringSheetEntry extends DTO.IRecurringSheetEntry {
    }

    export interface IRecurringSheetEntryEditScope extends ng.IScope {
        entry: IEditRecurringSheetEntry;
        categories: ng.resource.IResourceArray<DTO.ICategoryListing>;

        // copy enum
        // ReSharper disable once InconsistentNaming
        AccountType: typeof DTO.AccountType;

        saveEntry: IAction;
        cancel: IAction;
        deleteEntry: IAction;
        isLoaded: boolean;
    }

    export class RecurringSheetEntryEditController {
        public static $inject = ['$scope', '$location', '$routeParams', '$modal', 'recurringSheetEntryResource', 'categoryResource'];

        private api: ng.resource.IResourceClass<DTO.IAppUserMutate>;

        constructor(private $scope: IRecurringSheetEntryEditScope,
                    private $location: ng.ILocationService,
                    private $routeParams: IRecurringSheetEntryEditRouteParams,
                    private $modal: ng.ui.bootstrap.IModalService,
                    private recurringSheetEntryResource: Factories.IWebResourceClass<DTO.IRecurringSheetEntry>,
                    categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>) {
            $scope.cancel = () => this.redirectToOverview();
            $scope.isLoaded = false;
            $scope.AccountType = DTO.AccountType;

            $scope.categories = categoryResource.query(() => {
                this.signalCategoriesLoaded();
            });

            $scope.entry = recurringSheetEntryResource.get({
                id: $routeParams.id
            }, () => this.signalEntryLoaded());

            $scope.deleteEntry = () => this.deleteEntry();
            $scope.saveEntry = () => this.saveEntry();
        }

        private redirectToOverview() {
            this.$location.path('/manage/entry-template/');
        }

        private deleteEntry() {
            var res = ConfirmDialogController.create(this.$modal, {
                title: 'Regeltemplate verwijderen',
                bodyText: 'Weet je zeker dat je de regeltemplate wilt verwijderen?',
                dialogType: DialogType.Danger
            });

            res.result.then(() => this.deleteEntryCore());
        }

        private deleteEntryCore() {
            // server-side delete
            var params = {
                id: this.$routeParams.id
            };

            this.recurringSheetEntryResource['delete'](params, () => {
                this.redirectToOverview();
            });
        }

        private saveEntry() {
            var params = {
                id: this.$routeParams.id
            };

            this.$scope.isLoaded = false;
            var res = <ng.resource.IResource<any>> <any> this.recurringSheetEntryResource.update(params, this.$scope.entry);
            res.$promise.then((ret: DTO.IInsertId) => {
                this.redirectToOverview();
            });
            res.$promise['catch'](() => {
                this.$scope.isLoaded = true;
            });
        }

        private signalCategoriesLoaded() {
            if (this.$scope.entry.id) {
                this.$scope.isLoaded = true;
            }
        }

        private signalEntryLoaded() {
            if (this.$scope.categories.$resolved) {
                this.$scope.isLoaded = true;
            }
        }
    }
} 