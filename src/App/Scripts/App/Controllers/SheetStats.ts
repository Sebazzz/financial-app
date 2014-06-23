/// <init-options route="/sheet/:year/:month/stats"/>

module FinancialApp {
    
    export interface ISheetStatsRouteParams extends ng.route.IRouteParamsService {
        year: string;
        month: string;
    }

    export interface ISheetStatsScope extends ng.IScope {
        date: Moment;
    }

    export class SheetStatsController {
        static $inject = ["$scope", "$routeParams", "$location"];

        private isCategoriesLoaded = false;
        private isSheetLoaded = false;

        private year: number;
        private month: number;

        constructor(private $scope: ISheetStatsScope,
                            $routeParams: ISheetStatsRouteParams,
                    private $location: ng.ILocationService) {
            this.year = parseInt($routeParams.year, 10);
            this.month = parseInt($routeParams.month, 10);

            $scope.date = moment([this.year, this.month - 1 /* zero offset */]);

            // bail out if invalid date is provided (we can do this without checking with the server)
            if (!$scope.date.isValid()) {
                $location.path("/archive");
                return;
            }
        }
    }
}