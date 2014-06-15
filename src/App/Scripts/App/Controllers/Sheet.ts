/// <init-options route="/sheet/:year/:month"/>

module FinancialApp {
    'use strict';

    export interface ISheetScope {
        date: Moment;
    }

    export interface ISheetRouteParams extends ng.route.IRouteParamsService {
        year: string;
        month: string;
    }

    export class SheetController {
        static $inject = ["$scope", "$routeParams", "$location"];

        constructor($scope: ISheetScope, $routeParams: ISheetRouteParams, $location : ng.ILocationService) {
            $scope.date = moment([parseInt($routeParams.year, 10), parseInt($routeParams.month, 10) - 1]);
            
            // bail out if invalid date is provided
            if (!$scope.date.isValid()) {
                $location.path("/archive");
            }
        }
    }
}