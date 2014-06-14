/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/angularjs/angular-resource.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
/// <reference path="Controllers/ControllerInit.d.ts" />
/// <reference path="Factories/ResourceFactory.ts" />
/// <reference path="DTO.generated.d.ts" />
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
            var app = angular.module('main', ['ngRoute', 'ngMoment', 'ngResource', 'angular-loading-bar', 'ui.bootstrap']);

            app.config((function ($routeProvider, $locationProvider) {
                // generated routes
                FinancialApp.ControllerInitializer.registerControllerRoutes($routeProvider);

                // custom routes
                // ... special 'now' route
                $routeProvider.when("/now", {
                    redirectTo: Program.createNowRoute()
                });

                // fallback
                $routeProvider.otherwise({
                    redirectTo: '/'
                });

                // use the HTML5 History API (with automatic fallback)
                $locationProvider.html5Mode(true);
            }).withInject("$routeProvider", "$locationProvider"));

            // factories
            app.factory("categoryResource", FinancialApp.Factories.ResourceFactory("/api/category/:id"));

            // controllers
            FinancialApp.ControllerInitializer.registerControllers(app);

            // run
            app.run((function ($templateCache, $http) {
                $http.get('/Angular/Widgets/Loader.html', { cache: $templateCache });
            }).withInject("$templateCache", "$http"));

            // application cache (HTML5)
            Program.initAppCache();
        };

        Program.initAppCache = function () {
            // Check if a new cache is available on page load.
            window.addEventListener('load', function (e) {
                if (!window.applicationCache) {
                    return;
                }

                window.applicationCache.addEventListener('updateready', function () {
                    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                        // Browser downloaded a new app cache.
                        if (confirm('Een nieuwe versie is beschikbaar. Wens je te herladen?')) {
                            window.location.reload();
                        }
                    } else {
                        // Manifest didn't changed. Nothing new to server.
                    }
                }, false);
            }, false);
        };

        Program.createNowRoute = function () {
            var now = new Date();
            return '/sheet/' + now.getFullYear() + "/" + (now.getMonth() + 1);
        };
        return Program;
    })();
    FinancialApp.Program = Program;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=AppInit.js.map
