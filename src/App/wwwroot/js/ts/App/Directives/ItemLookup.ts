/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../../typings/moment/moment.d.ts" />

module FinancialApp.Directives {
    'use strict';

    interface IIdNameItem {
        id: number;
        name : string;
    }

    export function itemLookupFilter(input: number, array: IIdNameItem[]) {
        var item = Enumerable.from(array).firstOrDefault(x => x.id === input);

        if (!item) return '';
        return item.name;
    }
}