/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
var FinancialApp;
(function (FinancialApp) {
    (function (Directives) {
        'use strict';

        angular.module('ngMoment', []).filter("moment", function () {
            return function (input, format) {
                return moment(input).format(format);
            };
        });
    })(FinancialApp.Directives || (FinancialApp.Directives = {}));
    var Directives = FinancialApp.Directives;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=MomentJs.js.map
