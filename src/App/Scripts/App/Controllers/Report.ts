module FinancialApp {
    'use strict';

    export interface IReportControllerScope extends ng.IScope {
        
    }

    export class ReportController {
        static $inject = ["$scope"];

        constructor($scope: IReportControllerScope) {

        }
    } 
}