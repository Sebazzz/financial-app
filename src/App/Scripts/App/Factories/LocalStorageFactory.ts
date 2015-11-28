/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../Common.ts"/>

module FinancialApp.Factories {
    // ReSharper disable once InconsistentNaming
    export function LocalStorageFactory() {
        var fact = ($window: ng.IWindowService) => $window.localStorage;
        return fact.withInject("$window");
    }
}