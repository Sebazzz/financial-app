/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
var ng;
(function (ng) {
    (function (Moment) {
        'use strict';

        angular.module('ngMoment', []).filter("moment", function () {
            return function (input, format) {
                return moment(input).format(format);
            };
        });
    })(ng.Moment || (ng.Moment = {}));
    var Moment = ng.Moment;
})(ng || (ng = {}));
//# sourceMappingURL=MomentJs.js.map
