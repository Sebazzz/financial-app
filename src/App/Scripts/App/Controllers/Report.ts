module FinancialApp {
    'use strict';

    export interface IReportControllerScope extends ng.IScope {
        isLoaded: boolean;

        stats: DTO.ISheetGlobalStatistics[]
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
          
        }
    } 
}