/// <init-options route="/sheet/:year/:month"/>
/// <reference path="../../typings/linq/linq.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../DTOEnum.generated.ts"/>
/// <reference path="../Factories/ResourceFactory.ts"/>

module FinancialApp {
    'use strict';

    export module DTO {
        export interface ISheetEntry {
            category: ICategory;   
            editMode:boolean;
        }
    }

    export interface ISheetScope {
        date: Moment;
        isLoaded: boolean;
        sheet: DTO.ISheet;
        categories: DTO.ICategoryListing[];

        // copy enum
            // ReSharper disable once InconsistentNaming
        AccountType: DTO.AccountType;
        saveEntry: (entry : DTO.ISheetEntry) => void
    }

    export interface ISheetRouteParams extends ng.route.IRouteParamsService {
        year: string;
        month: string;
    }

    export class SheetController {
        static $inject = ["$scope", "$routeParams", "$location", "sheetResource", "categoryResource"];

        private isCategoriesLoaded = false;
        private isSheetLoaded = false;

        constructor(private $scope: ISheetScope,
                            $routeParams: ISheetRouteParams,
                    private $location: ng.ILocationService,
                    private sheetResource: Factories.ISheetWebResourceClass,
                    categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>) {

            var year = parseInt($routeParams.year, 10);
            var month = parseInt($routeParams.month, 10);

            $scope.date = moment([year, month - 1 /* zero offset */]);
            $scope.isLoaded = false;
            $scope.AccountType = <any> DTO.AccountType; // we need to copy the enum itself, or we won't be able to refer to it in the view

            // bail out if invalid date is provided (we can do this without checking with the server)
            if (!$scope.date.isValid()) {
                $location.path("/archive");
                return;
            }

            // get data
            $scope.sheet = sheetResource.getByDate({ year: year, month: month }, (data) => {
                this.signalSheetsLoaded(data);
            }, () => $location.path("/archive"));

            $scope.categories = categoryResource.query(() => {
                this.signalCategoriesLoaded();
            });

            $scope.saveEntry = (entry) => this.saveEntry(entry);
        }

        private signalSheetsLoaded(data) {
            this.isSheetLoaded = true;
            this.setLoadedBit(data);
        }

        private signalCategoriesLoaded() {
            this.isCategoriesLoaded = true;
            this.setLoadedBit(this.$scope.sheet);
        }

        private setLoadedBit(sheetData: DTO.ISheet) {
            this.$scope.isLoaded = this.isCategoriesLoaded && this.isSheetLoaded;

            if (!sheetData || !sheetData.entries) {
                return;
            }

            for (var i = 0; i < sheetData.entries.length; i++) {
                var entry = sheetData.entries[i];
                entry.category = Enumerable.From(this.$scope.categories).FirstOrDefault(c => entry.categoryId === c.id);
            }
        }

        private saveEntry(entry: DTO.ISheetEntry) {
            entry.editMode = false;
        }
    }
}