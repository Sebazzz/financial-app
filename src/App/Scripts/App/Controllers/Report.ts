module FinancialApp {
    'use strict';

    export interface IReportControllerScope extends ng.IScope {
        isLoaded: boolean;

        stats: DTO.ISheetGlobalStatistics[];
        incomeChartData: any;
        expenseChartData: any;
    }

    export class ReportController {
        static $inject = ["$scope", "$http"];

        constructor(private $scope: IReportControllerScope, private $http: ng.IHttpService) {
            this.loadStatistics();
        }

        private loadStatistics() {
            var stats: ng.IHttpPromise<DTO.ISheetGlobalStatistics[]> = this.$http.get<DTO.ISheetGlobalStatistics[]>("api/sheet/statistics");

            stats.success((data) => {
                this.$scope.stats = data;
                this.buildChartData();
                this.$scope.isLoaded = true;
            });
        }

        private buildChartData() {
            this.$scope.expenseChartData = ReportController.generateChart();
            this.$scope.expenseChartData.options.title = "Uitgaven per categorie";
            this.$scope.expenseChartData.data.rows = this.generateRows(this.$scope.expenseChartData, x => x.delta < 0, -1);
            Colors.Chart.setColors(this.$scope.expenseChartData.options);

            this.$scope.incomeChartData = ReportController.generateChart();
            this.$scope.incomeChartData.options.title = "Inkomen per categorie";
            this.$scope.incomeChartData.options.backgroundColor = "#000";
            this.$scope.incomeChartData.data.rows = this.generateRows(this.$scope.incomeChartData, x => x.delta >= 0);
            Colors.Chart.setColors(this.$scope.incomeChartData.options);

            this.removeAllZeroCategories(this.$scope.expenseChartData);
            this.removeAllZeroCategories(this.$scope.incomeChartData);
        }

        private removeAllZeroCategories(chartData: any) {
            var numberOfCategories = chartData.data.rows[0].c.length - 1;
            for (var catNum = 1; catNum < numberOfCategories + 1; catNum++) {
                var isAllZero = true;

                for (var i = 0; i < chartData.data.rows.length; i++) {
                    var row = chartData.data.rows[i];
                    var item = row.c;
                    
                    if (item[catNum].v != 0) {
                        isAllZero = false;
                        break;
                    }
                }

                if (isAllZero) {
                    for (var j = 0; j < chartData.data.rows.length; j++) {
                        var arr = chartData.data.rows[j].c;
                        arr.removeAt(catNum);
                    }

                    chartData.data.cols.removeAt(catNum);

                    catNum--;
                    numberOfCategories--;
                }
            }
        }

        private generateRows(chartData: any, filter: (item: DTO.ISheetCategoryStatistics) => boolean, modifier: number = 1) : any[] {
            var categories = Enumerable.from(this.$scope.stats)
                                       .selectMany(x => x.categoryStatistics)
                                       .select(x => x.categoryName)
                                       .distinct();
            
            var catColumns = Enumerable.from(categories)
                .select(x => <any> ReportController.generateColumn(x));

            chartData.data.cols = Enumerable.from(chartData.data.cols).union(catColumns).toArray();

            var categoryToIndex = categories.select((x, idx) => { return { item: x, index: idx + 1 }; }).toDictionary(x => x.item, x=>x.index);

            return Enumerable.from(this.$scope.stats)
                             .select(x => ReportController.generateSingleRow(x, categoryToIndex,filter, modifier))
                             .toArray();

        }

        private static generateSingleRow(data: DTO.ISheetGlobalStatistics, categoryToIndexMapping: linqjs.IDictionary<any,any>, filter: (item: DTO.ISheetCategoryStatistics) => boolean, modifier) : Object {
            var dataItems = [
                {
                    v: <any>moment(data.sheetSubject).format('MMMM YYYY')
                }
            ];

            for (var i = 0; i < data.categoryStatistics.length; i++) {
                var stat = data.categoryStatistics[i];
                if (filter(stat) === false) {
                    continue;
                }

                var index = categoryToIndexMapping.get(stat.categoryName);
                dataItems[index] = {
                    v: stat.delta * modifier
                };
            }

            // set untouched items
            var mapping = categoryToIndexMapping.toEnumerable().toArray();
            for (var j=0;j<mapping.length;j++) {
                var idx = mapping[j].value;
                if (!dataItems[idx]) {
                    dataItems[idx] = { v: 0 };
                }
            }

            return {
                c: dataItems
            };
        }

        private static generateColumn(categoryName: string): Object {
            return {
                id: categoryName,
                label: categoryName,
                type: "number"
            };
        }

        private static generateChart(): Object {
            return {
                "type": "LineChart",
                "displayed": true,
                "data": {
                    "cols": [
                        {
                            "id": "month",
                            "label": "Maand",
                            "type": "string"
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