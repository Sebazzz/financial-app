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
        isLoaded: boolean;

        stats: DTO.ISheetGlobalStatistics;
        incomeChartData: any;
        expenseChartData: any;
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
            $scope.isLoaded = false;

            $scope.previousDate = moment($scope.date).subtract(1, 'month');
            $scope.nextDate = moment($scope.date).add(1, 'month');
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
                this.buildChartData();
                this.$scope.isLoaded = true;
            });
        }

        private buildChartData() {
            this.$scope.expenseChartData = SheetStatsController.generateChart();
            this.$scope.expenseChartData.options.title = "Uitgaven per categorie";
            this.$scope.expenseChartData.data.rows = this.generateExpenseCharRows(x => x.delta < 0, -1);
            Colors.Chart.setColors(this.$scope.expenseChartData.options);

            this.$scope.incomeChartData = SheetStatsController.generateChart();
            this.$scope.incomeChartData.options.title = "Inkomen per categorie";
            this.$scope.incomeChartData.data.rows = this.generateExpenseCharRows(x => x.delta >= 0);
            Colors.Chart.setColors(this.$scope.incomeChartData.options);
        }

        private generateExpenseCharRows(filter: (item: DTO.ISheetCategoryStatistics) => boolean, modifier: number = 1) {
            return Enumerable.from(this.$scope.stats.categoryStatistics)
                .where(filter)
                .select(x => {
                    return {
                        "c": [
                            {
                                "v": x.categoryName
                            },
                            {
                                "v": x.delta * modifier
                            }
                        ]
                    }
                }).toArray();
        }

        private static generateChart(): Object {
            return {
                "type": "PieChart",
                "displayed": true,
                "data": {
                    "cols": [
                        {
                            "id": "category",
                            "label": "Categorie",
                            "type": "string"
                        },
                        {
                            "id": "amount",
                            "label": "Hoeveelheid",
                            "type": "number"
                        }
                    ],
                    "rows": []
                },
                "options": {
                    "title": "",
                    "isStacked": "true",
                    "fill": 20,
                    "displayExactValues": true
                },
                "formatters": {},
                "view": {}

            };
        }
    }
}