/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../../typings/moment/moment.d.ts" />

module FinancialApp.Directives {
    'use strict';

    angular.module('ngMoment', [])
        .filter("moment", () => function (input: any, arg: any) {
            var m = moment(input);
            var fn, args;

            if (typeof arg === "string") {
                return m.format(arg);
            } else if (Array.isArray(arg)) {
                fn = arg[0];
                args = arg.splice(1);
            } else {
                fn = arg['func'];
                args = arg.arguments || [];
            }

            return m[fn].apply(m, args);
        });
}