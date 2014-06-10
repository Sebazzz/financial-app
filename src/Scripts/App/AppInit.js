/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/angularjs/angular-resource.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
/// <reference path="ControllerInit.d.ts" />
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var Program = (function () {
        function Program() {
        }
        Program.init = function () {
            /// <summary>Initializes the application</summary>
            if (Program.isInitialized === true) {
                throw new Error("App is initialized");
            }

            Program.isInitialized = true;

            // moment language
            moment.lang('nl');

            // define module
            var app = angular.module('main', ['ngRoute', 'ngMoment']);

            app.config(function ($routeProvider, $locationProvider) {
                // generated routes
                FinancialApp.ControllerInitializer.registerControllerRoutes($routeProvider);

                // special 'now' route
                var now = new Date();
                $routeProvider.when("/now", {
                    redirectTo: '/sheet/' + now.getFullYear() + "/" + now.getMonth()
                });

                // fallback
                $routeProvider.otherwise({
                    redirectTo: '/'
                });

                // use the HTML5 History API (without automatic fallback)
                $locationProvider.html5Mode(true);
            });

            // controllers
            FinancialApp.ControllerInitializer.registerControllers(app);
        };
        return Program;
    })();
    FinancialApp.Program = Program;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=AppInit.js.map
