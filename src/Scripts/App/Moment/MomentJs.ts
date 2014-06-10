/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../../typings/moment/moment.d.ts" />

module ng.Moment {

    angular.module('ngMoment', [])
        .filter("moment", () => (input: any, format: string) => moment(input).format(format));
}