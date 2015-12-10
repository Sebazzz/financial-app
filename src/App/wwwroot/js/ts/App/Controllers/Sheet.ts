/// <init-options route="/sheet/:year/:month"/>
/// <reference path="../../typings/linq/linq.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../DTOEnum.generated.ts"/>
/// <reference path="../Factories/ResourceFactory.ts"/>
/// <reference path="../Services/CalculationService.ts"/>
/// <reference path="../../typings/angular-ui-bootstrap/angular-ui-bootstrap.d.ts"/>

module FinancialApp {
    'use strict';

    export module DTO {
        export interface ISheetEntry {
            category: ICategory;   
            editMode: boolean;
            isBusy: boolean;
        }

        export interface ISheet {
            totalSavings: () => number;
            totalBank: () => number;
        }
    }

    export interface ISheetScope {
        date: Moment;
        previousDate: Moment;
        isLoaded: boolean;
        sheet: DTO.ISheet;
        categories: DTO.ICategoryListing[];

        // copy enum
            // ReSharper disable once InconsistentNaming
        AccountType: typeof DTO.AccountType;
            // ReSharper disable once InconsistentNaming
        SortOrderMutation: typeof Factories.SortOrderMutation;

        saveEntry: (entry: DTO.ISheetEntry) => void
        deleteEntry: (entry: DTO.ISheetEntry) => void
        editRemarks: (entry: DTO.ISheetEntry) => void
        addEntry: () => void;
        mutateSortOrder: (entry:DTO.ISheetEntry, mutation: Factories.SortOrderMutation) => void;
    }

    export interface ISheetRouteParams extends ng.route.IRouteParamsService {
        year: string;
        month: string;
    }

    export class SheetController {
        static $inject = ["$scope", "$routeParams", "$location", "$modal", "sheetResource", "sheetEntryResource", "categoryResource", "calculation"];

        private isCategoriesLoaded = false;
        private isSheetLoaded = false;

        private year: number;
        private month : number;

        constructor(private $scope: ISheetScope,
                            $routeParams: ISheetRouteParams,
                    private $location: ng.ILocationService,
                    private $modal : ng.ui.bootstrap.IModalService,
                    private sheetResource: Factories.ISheetWebResourceClass,
                    private sheetEntryResource: Factories.ISheetEntryWebResourceClass,
                    categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>,
                    private calculation : Services.CalculationService) {

            this.year = parseInt($routeParams.year, 10);
            this.month = parseInt($routeParams.month, 10);

            $scope.date = moment([this.year, this.month - 1 /* zero offset */]);
            $scope.previousDate = moment($scope.date).subtract(1, 'month');
            $scope.isLoaded = false;
            $scope.AccountType = DTO.AccountType; // we need to copy the enum itself, or we won't be able to refer to it in the view
            $scope.SortOrderMutation = Factories.SortOrderMutation; // we need to copy the enum itself, or we won't be able to refer to it in the view

            // bail out if invalid date is provided (we can do this without checking with the server)
            if (!$scope.date.isValid()) {
                $location.path("/archive");
                return;
            }

            // get data
            $scope.sheet = sheetResource.getByDate({ year: this.year, month: this.month }, (data) => {
                this.signalSheetsLoaded(data);
            }, () => $location.path("/archive"));

            $scope.categories = categoryResource.query(() => {
                this.signalCategoriesLoaded();
            });

            $scope.saveEntry = (entry) => this.saveEntry(entry);
            $scope.deleteEntry = (entry) => this.deleteEntry(entry);
            $scope.addEntry = () => this.addEntry();
            $scope.editRemarks = (entry) => this.editRemarks(entry);
            $scope.mutateSortOrder = (entry, mutation) => this.mutateSortOrder(entry, mutation);
        }

        private mutateSortOrder(entry: DTO.ISheetEntry, mutation: Factories.SortOrderMutation) {
            var entries = this.$scope.sheet.entries;
            var index = entries.indexOf(entry);
            var newIndex: number = index + mutation;
            if (newIndex < 0 || newIndex >= entries.length) {
                return;
            }

            entry.isBusy = true;
            this.sheetEntryResource.mutateOrder({
                sheetMonth: this.month,
                sheetYear: this.year,
                id: entry.id,
                mutation: Factories.SortOrderMutation[mutation]
            }, {}, () => {
                entries[index] = entries[newIndex];
                entries[newIndex] = entry;
                entry.sortOrder += mutation;
                entry.isBusy = false;
            }, () => entry.isBusy = false);
        }

        private signalSheetsLoaded(sheet : DTO.ISheet) {
            this.isSheetLoaded = true;

            sheet.totalSavings = () => this.calculation.calculateTotal(sheet, FinancialApp.DTO.AccountType.SavingsAccount);
            sheet.totalBank = () => this.calculation.calculateTotal(sheet, FinancialApp.DTO.AccountType.BankAccount);

            this.setLoadedBit(sheet);
        }

        private signalCategoriesLoaded() {
            this.isCategoriesLoaded = true;
            this.setLoadedBit(this.$scope.sheet);
        }

        private setLoadedBit(sheetData: DTO.ISheet) {
            this.$scope.isLoaded = this.isCategoriesLoaded && this.isSheetLoaded;

            if (!sheetData || !sheetData.entries || !this.$scope.isLoaded) {
                return;
            }

            for (var i = 0; i < sheetData.entries.length; i++) {
                var entry = sheetData.entries[i];
                entry.category = Enumerable.from(this.$scope.categories).first(c => entry.categoryId === c.id);
            }
        }

        private editRemarks(entry: DTO.ISheetEntry) {
            this.$modal.open({
                templateUrl: '/Angular/Widgets/Sheet-EditRemarks.html',
                controller: RemarksDialogController,
                resolve: {
                    entry: () => entry
                }
            });
        }

        private saveEntry(entry: DTO.ISheetEntry) {
            entry.editMode = false;
            entry.isBusy = true;

            // santize
            entry.categoryId = entry.category.id;

            if (!(entry.id > 0)) {
                this.saveAsNewEntry(entry);
                return;
            }

            var params = {
                sheetMonth: this.month,
                sheetYear: this.year,
                id: entry.id
            };

            var res = <ng.resource.IResource<any>> <any> this.sheetEntryResource.update(params, entry);
            res.$promise.then(() => {
                entry.isBusy = false;
                this.$scope.sheet.updateTimestamp = moment();
            });
            res.$promise['catch'](() => {
                entry.isBusy = false;
                entry.editMode = true;
            });
        }

        private saveAsNewEntry(entry: DTO.ISheetEntry) {
            var params = {
                sheetMonth: this.month,
                sheetYear: this.year
            };

            var res = <ng.resource.IResource<any>> <any> this.sheetEntryResource.save(params, entry);
            res.$promise.then((data) => {
                entry.id = data.id;
                entry.isBusy = false;
                this.$scope.sheet.updateTimestamp = moment();
            });
            res.$promise['catch'](() => {
                entry.isBusy = false;
                entry.editMode = true;
            });
        }

        private deleteEntry(entry: DTO.ISheetEntry) {
            var res = ConfirmDialogController.create(this.$modal, {
                title: 'Regel verwijderen',
                bodyText: 'Weet je zeker dat je de regel "' + entry.source + "' wilt verwijderen?",
                dialogType: DialogType.Danger
            });

            res.result.then(() => this.deleteEntryCore(entry));
        }

        private deleteEntryCore(entry: DTO.ISheetEntry) {
            entry.isBusy = true;
            entry.editMode = false;

            // if the entry has not been saved, we can delete it right away
            if (entry.id == 0) {
                this.$scope.sheet.entries.remove(entry);
                return;
            }

            // server-side delete
            var params = {
                sheetMonth: this.month,
                sheetYear: this.year,
                id: entry.id
            };

            this.sheetEntryResource['delete'](params,
                () => {
                    this.$scope.sheet.entries.remove(entry);
                    this.$scope.sheet.updateTimestamp = moment();
                },
                () => entry.isBusy = false);
        }

        private addEntry(): void {
            var newEntry: DTO.ISheetEntry = {
                id: 0,
                account: FinancialApp.DTO.AccountType.BankAccount,
                categoryId: null,
                category: null,
                createTimestamp: moment(),
                delta: 0,
                remark: null,
                source: null,
                editMode: true,
                updateTimestamp: moment(),
                isBusy: false,
                sortOrder: Enumerable.from(this.$scope.sheet.entries).defaultIfEmpty(<any>{sortOrder: 0}).max(x => x.sortOrder) + 1
            };

            this.$scope.sheet.entries.push(newEntry);
        }
    }

    interface IRemarksDialogControllerScope extends ng.IScope {
        entry: DTO.ISheetEntry;
        originalRemarks: string;

        saveChanges: IAction;
        cancel: IAction;
    }

    class RemarksDialogController {
        static $inject = ["$scope", "$modalInstance", "entry"];

        constructor(private $scope: IRemarksDialogControllerScope, $modalInstance : ng.ui.bootstrap.IModalServiceInstance, entry : DTO.ISheetEntry) {
            $scope.entry = entry;
            $scope.originalRemarks = entry.remark;

            $scope.saveChanges = () => $modalInstance.close();

            $scope.cancel = () => {
                $scope.entry.remark = $scope.originalRemarks;
                $modalInstance.dismiss();
            };
        }
    }
}