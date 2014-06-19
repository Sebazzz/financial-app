/// <init-options route="/sheet/:year/:month"/>
/// <reference path="../../typings/linq/linq.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../DTOEnum.generated.ts"/>
/// <reference path="../Factories/ResourceFactory.ts"/>

module FinancialApp {
    'use strict';

    export interface ISheetScope {
        date: Moment;
        isLoaded: boolean;
        sheet: DTO.ISheet;
        categories: DTO.ICategoryListing[];

        // copy enum
            // ReSharper disable once InconsistentNaming
        AccountType: DTO.AccountType;

        getCategory: (id:number) => DTO.ICategory;
    }

    export interface ISheetRouteParams extends ng.route.IRouteParamsService {
        year: string;
        month: string;
    }

    export class SheetController {
        static $inject = ["$scope", "$routeParams", "$location", "sheetResource", "categoryResource"];

        constructor(private $scope: ISheetScope,
                            $routeParams: ISheetRouteParams,
                    private $location: ng.ILocationService,
                    private sheetResource: Factories.ISheetWebResourceClass,
                    categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>) {

            var year = parseInt($routeParams.year, 10);
            var month = parseInt($routeParams.month, 10);

            var isCategoriesLoaded = false;
            var isSheetLoaded = false;

            $scope.date = moment([year, month - 1 /* zero offset */]);
            $scope.isLoaded = false;
            $scope.AccountType = <any> DTO.AccountType; // we need to copy the enum itself, or we won't be able to refer to it in the view

            // bail out if invalid date is provided (we can do this without checking with the server)
            if (!$scope.date.isValid()) {
                $location.path("/archive");
                return;
            }

            // get data
            $scope.sheet = sheetResource.getByDate({ year: year, month: month }, () => {
                isSheetLoaded = true;
                $scope.isLoaded = isSheetLoaded && isCategoriesLoaded;
            }, () => $location.path("/archive"));

            $scope.categories = categoryResource.query(() => {
                isCategoriesLoaded = true;
                $scope.isLoaded = isSheetLoaded && isCategoriesLoaded;
            });

            $scope.getCategory = id => Enumerable.From($scope.categories).FirstOrDefault(c => c.id == id);
        }
    }
}