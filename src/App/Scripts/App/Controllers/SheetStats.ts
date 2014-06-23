/// <init-options route="/sheet/:year/:month/stats"/>

module FinancialApp {
    
    export interface ISheetStatsRouteParams extends ng.route.IRouteParamsService {
        year: string;
        month: string;
    }

    export interface ISheetStatsScope extends ng.IScope {
        date: Moment;
        previousDate: Moment;
        nextDate: Moment;
        isLoading: boolean;
        stats: DTO.ISheetGlobalStatistics;
    }

    export class SheetStatsController {
        static $inject = ["$scope", "$routeParams", "$location", "$http"];

        private isCategoriesLoaded = false;
        private isSheetLoaded = false;

        private year: number;
        private month: number;

        constructor(private $scope: ISheetStatsScope,
                            $routeParams: ISheetStatsRouteParams,
                    private $location: ng.ILocationService,
                    private $http : ng.IHttpService) {
            this.year = parseInt($routeParams.year, 10);
            this.month = parseInt($routeParams.month, 10);

            $scope.date = moment([this.year, this.month - 1 /* zero offset */]);
            $scope.isLoading = true;

            $scope.previousDate = moment($scope.date).subtract('month', 1);
            $scope.nextDate = moment($scope.date).add('month', 1);
            if ($scope.nextDate.isAfter()) {
                $scope.nextDate = null;
            }

            // bail out if invalid date is provided (we can do this without checking with the server)
            if (!$scope.date.isValid()) {
                $location.path("/archive");
                return;
            }

            this.loadStatistics();
        }

        private loadStatistics() {
            var stats: ng.IHttpPromise<DTO.ISheetGlobalStatistics> = this.$http.get<DTO.ISheetGlobalStatistics>(
                "api/sheet/" + this.year + "-" + this.month + "/statistics");

            stats.success((data) => {
                this.$scope.stats = data;
                this.$scope.isLoading = false;
            });
        }
    }
}