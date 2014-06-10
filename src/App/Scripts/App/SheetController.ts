/// <init-options route="/sheet/:year/:month"/>

module FinancialApp {
    export interface ISheetScope {
        date: Moment;
    }

    export interface ISheetRouteParams extends ng.route.IRouteParamsService {
        year: string;
        month: string;
    }

    export class SheetController {
        static $inject = ["$scope", "$routeParams"];

        constructor($scope: ISheetScope, $routeParams: ISheetRouteParams) {
            $scope.date = moment([parseInt($routeParams.year, 10), parseInt($routeParams.month, 10) - 1]);
        }
    }
}