/// <init-options route="/manage/entry-template"/>
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../Common.ts"/>

module FinancialApp {
    'use strict';

    export interface IRecurringSheetEntryListControllerScope extends ng.IScope {
        entries: DTO.IRecurringSheetEntryListing[];
        isLoaded: boolean;

        busyStatus: IBusyStatus;
        deleteEntry: IAction1<DTO.IRecurringSheetEntryListing>;

        mutateSortOrder: (entry: DTO.IRecurringSheetEntryListing, mutation: Factories.SortOrderMutation) => void;

        // copy enum
        // ReSharper disable once InconsistentNaming
        AccountType: typeof DTO.AccountType;
        // ReSharper disable once InconsistentNaming
        SortOrderMutation: typeof Factories.SortOrderMutation;
    }

    // seperate object to make available in child scope
    export interface IBusyStatus {
        isBusy : boolean;
    }

    export class RecurringSheetEntryListController {
        public static $inject = ['$scope', '$modal', 'recurringSheetEntryResource'];

        private api: Factories.IRecurringSheetEntryWebResourceClass<DTO.IRecurringSheetEntryListing>;

        constructor(private $scope: IRecurringSheetEntryListControllerScope,
                    private $modal: ng.ui.bootstrap.IModalService,
                    recurringSheetEntryResource: Factories.IRecurringSheetEntryWebResourceClass<DTO.IRecurringSheetEntryListing>) {
            this.api = recurringSheetEntryResource;

            $scope.AccountType = DTO.AccountType; // we need to copy the enum itself, or we won't be able to refer to it in the view
            $scope.SortOrderMutation = Factories.SortOrderMutation; // we need to copy the enum itself, or we won't be able to refer to it in the view

            $scope.busyStatus = {
                isBusy: false
            };

            $scope.entries = this.api.query(() => {
                $scope.isLoaded = true;
            });

            $scope.deleteEntry = (cat: DTO.IRecurringSheetEntryListing) => {
                this.deleteEntry(cat);
            };

            $scope.mutateSortOrder = (entry, mutation) => this.mutateSortOrder(entry, mutation);
        }

        private mutateSortOrder(entry: DTO.IRecurringSheetEntryListing, mutation: Factories.SortOrderMutation) {
            var entries = this.$scope.entries;
            var index = entries.indexOf(entry);
            var newIndex: number = index + mutation;
            if (newIndex < 0 || newIndex >= entries.length) {
                return;
            }

            this.$scope.busyStatus.isBusy = true;
            this.api.mutateOrder({
                id: entry.id,
                mutation: Factories.SortOrderMutation[mutation]
            }, {}, () => {
                entries[index] = entries[newIndex];
                entries[newIndex] = entry;
                entry.sortOrder += mutation;
                this.$scope.busyStatus.isBusy = false;
            }, () => this.$scope.busyStatus.isBusy = false);
        }

        private deleteEntry(entry: DTO.IRecurringSheetEntryListing) {
            var res = ConfirmDialogController.create(this.$modal, {
                title: 'Regeltemplate verwijderen',
                bodyText: `Weet je zeker dat je de regeltemplate "${entry.source}" wilt verwijderen?`,
                dialogType: DialogType.Danger
            });

            res.result.then(() => this.deleteEntryCore(entry));
        }

        private deleteEntryCore(entry: DTO.IRecurringSheetEntryListing) {
            this.$scope.busyStatus.isBusy = true;
            this.api['delete']({ id: entry.id }, () => {
                this.$scope.busyStatus.isBusy = false;
                this.$scope.entries.remove(entry);
            });
        }

    }

}