/// <init-options route="/manage/entry-template"/>
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../Common.ts"/>

module FinancialApp {
    'use strict';

    export interface IRecurringSheetEntryListControllerScope extends ng.IScope {
        entries: DTO.IRecurringSheetEntryListing[];
        isLoaded: boolean;
        deleteEntry: IAction1<DTO.IRecurringSheetEntryListing>;
    }

    export class RecurringSheetEntryListController {
        public static $inject = ['$scope', '$modal', 'recurringSheetEntryResource'];

        private api: ng.resource.IResourceClass<DTO.IRecurringSheetEntryListing>;

        constructor(private $scope: IRecurringSheetEntryListControllerScope,
                    private $modal: ng.ui.bootstrap.IModalService,
                    recurringSheetEntryResource: ng.resource.IResourceClass<DTO.IRecurringSheetEntryListing>) {
            this.api = recurringSheetEntryResource;

            $scope.entries = this.api.query(() => {
                $scope.isLoaded = true;
            });

            $scope.deleteEntry = (cat: DTO.IRecurringSheetEntryListing) => {
                this.deleteEntry(cat);
            };
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
            this.$scope.isLoaded = false;
            this.api['delete']({ id: entry.id }, () => {
                this.$scope.isLoaded = true;
                this.$scope.entries.remove(entry);
            });
        }

    }

}