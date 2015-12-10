 /// <reference path="../../typings/angularjs/angular.d.ts" /> 
 /// <reference path="../../typings/angularjs/angular-route.d.ts" /> 
 /// <reference path="../../typings/angularjs/angular-resource.d.ts" /> 

declare module FinancialApp {
    export class ControllerInitializer {
        static registerControllers($app : ng.IModule) : void;
        static registerControllerRoutes($routeProvider : ng.route.IRouteProvider) : void;
    }
}